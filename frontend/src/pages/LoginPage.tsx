import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';

const LoginPage = () => {
  const { isLoggedIn, setIsLoggedIn, setProfile } = useAppContext();
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (isLoggedIn) {
      navigate('/dashboard');
    }
    
    // Simulate page loading
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate]);

  // Send OTP to Email
  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/send-otp', { email });
      setStep(2);
      setMessage(response.data.message || 'OTP sent to your email');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate OTP
    if (!otp) {
      setError('OTP is required');
      return;
    }
    
    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be 6 digits');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/verify-otp', { email, otp });
      setMessage(response.data.message || 'Authentication successful');
      
      // Get profile after successful verification
      const profileResponse = await axios.get('/profile');
      setProfile(profileResponse.data);
      setIsLoggedIn(true);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // Go back to email step
  const goBack = () => {
    setStep(1);
    setOTP('');
    setError('');
  };

  // Render skeleton loader
  const renderSkeleton = () => (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="skeleton skeleton-text" style={{ height: '2.5rem', width: '70%', margin: '0 auto 1rem' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '50%', margin: '0 auto' }}></div>
        </div>
        
        <div className="auth-form" style={{ marginTop: 'var(--spacing-xl)' }}>
          <div className="form-group">
            <div className="skeleton skeleton-text" style={{ width: '30%', height: '1rem' }}></div>
            <div className="skeleton" style={{ height: '2.5rem', marginTop: 'var(--spacing-sm)' }}></div>
          </div>
          
          <div className="skeleton" style={{ height: '2.5rem', marginTop: 'var(--spacing-lg)' }}></div>
        </div>
      </div>
    </div>
  );

  if (pageLoading) {
    return renderSkeleton();
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-info">{message}</div>}
        
        {step === 1 ? (
          <div className="auth-form animate-slide-up">
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
                  autoFocus
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-text">
                    <span className="dot-animation"></span>
                    Sending OTP
                  </span>
                ) : "Send OTP"}
              </button>
            </form>
          </div>
        ) : (
          <div className="auth-form animate-slide-up">
            <p className="email-info">OTP sent to: <strong>{email}</strong></p>
            
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
                  autoFocus
                />
              </div>
              
              <div className="btn-group">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={goBack}
                  disabled={loading}
                >
                  Back
                </button>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading-text">
                      <span className="dot-animation"></span>
                      Verifying
                    </span>
                  ) : "Verify OTP"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage; 