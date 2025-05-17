import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TwoFactorForm from './TwoFactorForm';
import './styles/Auth.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const handleInitialLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        email,
        password,
      });

      if (response.data.requires_2fa) {
        setShow2FA(true);
      } else if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        setShowToast(true);
        setTimeout(() => {
          onLogin({ email, token: response.data.access });
          navigate('/profile');
        }, 2500);
      }
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      {!show2FA ? (
        <form onSubmit={handleInitialLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={show2FA}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={show2FA}
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
        </form>
      ) : (
        <TwoFactorForm
          email={email}
          password={password}
          onLogin={onLogin}
          setError={setError}
          setShowToast={setShowToast}
          navigate={navigate}
        />
      )}
      {showToast && (
        <div className="success-toast">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle
              cx="10"
              cy="10"
              r="9"
              stroke="#00ffae"
              strokeWidth="2"
              fill="none"
              style={{
                strokeDasharray: 157,
                strokeDashoffset: 0,
                animation: 'circle-animation 0.6s ease forwards',
              }}
            />
            <path
              d="M6 10L9 13L14 7"
              stroke="#00ffae"
              strokeWidth="2"
              fill="none"
              style={{ animation: 'drawCheck 0.5s ease forwards' }}
            />
          </svg>
          <span className="success-message">Login successful!</span>
        </div>
      )}
    </div>
  );
};

export default Login;