import { useEffect, useState } from 'react';
import Auth from './Auth';
function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api') // Calls the backend at http://localhost:3000/api
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("API Error:", err));
  }, []);

  return (
    <div>
      <Auth />
      <p>{message}</p>
    </div>
  );
}

export default App;
