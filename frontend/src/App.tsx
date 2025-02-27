import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Check Backend Connection and Auth Status
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if backend is reachable
        const apiResponse = await axios.get("/api");
        setMessage(apiResponse.data.message);
        
        // Check authentication status
        try {
          const profileResponse = await axios.get("/profile");
          setProfile(profileResponse.data);
          setIsLoggedIn(true);
          setEmail(profileResponse.data.user?.email || "");
        } catch (authError) {
          console.log("User not authenticated");
        }
      } catch (error) {
        setError("Backend not reachable. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Send OTP to Email
  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      setError("Email is required");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post("/send-otp", { email });
      setStep(2);
      setMessage(response.data.message || "OTP sent to your email");
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate OTP
    if (!otp) {
      setError("OTP is required");
      return;
    }
    
    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be 6 digits");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post("/verify-otp", { email, otp });
      setMessage(response.data.message || "Authentication successful");
      
      // Get profile after successful verification
      const profileResponse = await axios.get("/profile");
      setProfile(profileResponse.data);
      setIsLoggedIn(true);
    } catch (error: any) {
      setError(error.response?.data?.error || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/logout");
      setIsLoggedIn(false);
      setStep(1);
      setEmail("");
      setOTP("");
      setMessage(response.data.message || "Logged out successfully");
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  // Go back to email step
  const goBack = () => {
    setStep(1);
    setOTP("");
    setError("");
  };

  return (
    <div className="container">
      <h1>Email OTP Authentication</h1>
      
      {loading ? (
        <div className="loader-container">
          <div className="loader">
            <div className="spinner"></div>
          </div>
          <p className="loader-message">Loading...</p>
        </div>
      ) : isLoggedIn ? (
        <div className="profile-container">
          <p className="success">✅ Logged in as {profile?.user?.email}</p>
          
          <div className="profile-info">
            <h2>Profile Information</h2>
            <p><strong>Email:</strong> {profile?.user?.email}</p>
            <p><strong>Status:</strong> {profile?.message}</p>
          </div>
          
          <button className="logout-btn" onClick={logout} disabled={loading}>
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      ) : (
        <div className="auth-container">
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-info">{message}</div>}
          
          {step === 1 ? (
            <div className="auth-form">
              <h2>Login with Email OTP</h2>
              
              <form onSubmit={sendOTP}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="primary-btn w-full"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            </div>
          ) : (
            <div className="auth-form">
              <h2>Enter OTP</h2>
              
              <p className="email-info">OTP sent to: {email}</p>
              
              <form onSubmit={verifyOTP}>
                <div className="form-group">
                  <label htmlFor="otp">One-Time Password</label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value)}
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
                
                <div className="btn-group">
                  <button 
                    type="button" 
                    className="secondary-btn"
                    onClick={goBack}
                  >
                    Back
                  </button>
                  
                  <button 
                    type="submit" 
                    className="primary-btn"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
