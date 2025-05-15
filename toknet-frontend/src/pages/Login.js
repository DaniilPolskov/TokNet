import React, { useState } from 'react';
import axios from 'axios';
import './styles/Auth.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [error, setError] = useState('');

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
        onLogin({ email, token: response.data.access });
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        email,
        password,
        code,
      });

      localStorage.setItem('access_token', response.data.access);
      onLogin({ email, token: response.data.access });
    } catch (err) {
      setError('Invalid 2FA code');
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={show2FA ? handle2FASubmit : handleInitialLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Email"
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={show2FA}
          />
        </div>

        {show2FA && (
          <div className="form-group">
            <label htmlFor="code">2FA Code</label>
            <input
              type="text"
              id="code"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" className="auth-button">
          {show2FA ? 'Confirm 2FA' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
