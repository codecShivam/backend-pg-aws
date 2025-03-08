import { useState, useEffect } from "react";
import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import "./App.css";

// Components
import Layout from "./components/layout/Layout";

// Types
export interface User {
  email: string;
  username?: string;
  full_name?: string;
  bio?: string;
  profile_image_url?: string;
  created_at: string;
}

export interface ProfileData {
  user: User;
}

type ContextType = {
  isLoggedIn: boolean;
  profile: ProfileData | null;
  setProfile: (profile: ProfileData) => void;
  setIsLoggedIn: (value: boolean) => void;
  logout: () => Promise<void>;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Configure axios defaults
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Check Backend Connection and Auth Status
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if backend is reachable
        await axios.get("/api");
        
        // Check authentication status
        try {
          const profileResponse = await axios.get("/profile");
          setProfile(profileResponse.data);
          setIsLoggedIn(true);
        } catch (authError) {
          console.log("User not authenticated");
          navigate('/login');
        }
      } catch (error) {
        setError("Backend not reachable. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [navigate]);

  // Logout
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await axios.post("/logout");
      setIsLoggedIn(false);
      setProfile(null);
      navigate('/login');
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <Layout isLoggedIn={isLoggedIn} logout={logout}>
      {error && <div className="global-error">{error}</div>}
      <Outlet context={{ 
        isLoggedIn, 
        profile, 
        setProfile, 
        setIsLoggedIn, 
        logout 
      } as ContextType} />
    </Layout>
  );
}

export function useAppContext() {
  return useOutletContext<ContextType>();
}

export default App;
