import { useState } from 'react';
import axios from 'axios';

function Auth() {
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter OTP
  const [message, setMessage] = useState('');

  const sendOTP = async () => {
    try {
      const response = await axios.post('http://localhost:3000/send-otp', { email });
      console.log(response)
      setStep(2);
      setMessage('OTP sent to your email.');
    } catch (error) {
      setMessage('Failed to send OTP');

    }
  };

  const verifyOTP = async () => {
    try {
      const res = await axios.post('http://localhost:3000/verify-otp', { email, otp });
      setMessage(res.data.message);
    } catch (error) {
      setMessage('Invalid or expired OTP');
    }
  };

  return (
    <div>
      <h1>Email OTP Authentication</h1>
      {step === 1 ? (
        <>
          <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={sendOTP}>Send OTP</button>
        </>
      ) : (
        <>
          <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOTP(e.target.value)} />
          <button onClick={verifyOTP}>Verify OTP</button>
        </>
      )}
      <p>{message}</p>
    </div>
  );
}

export default Auth;
