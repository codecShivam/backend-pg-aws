import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';

const HomePage = () => {
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to OTP Auth</h1>
        <p>Redirecting you to the appropriate page...</p>
      </div>
    </div>
  );
};

export default HomePage; 