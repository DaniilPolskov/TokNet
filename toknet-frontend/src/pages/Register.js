import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Auth.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const Register = ({ onRegister }) => {
  const [step, setStep] = useState(1);
  const [authType, setAuthType] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const emailOrPhone = authType === 'email' ? email : `+${phone}`;

  const handleSendCode = (e) => {
    e.preventDefault();

    if ((authType === 'email' && !email) || (authType === 'phone' && !phone)) {
      setError('Please enter your email or phone.');
      return;
    }

    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code) {
      setError('Please enter the code sent to you.');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_or_phone: emailOrPhone, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      onRegister(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Register</h2>
        {error && <div className="auth-error">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendCode}>
            <div className="form-group">
              <label>Register with</label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value)}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>

            {authType === 'email' ? (
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Phone</label>
                <PhoneInput
                  country={'us'}
                  value={phone}
                  onChange={setPhone}
                  inputProps={{
                    name: 'phone',
                    required: true,
                  }}
                />
              </div>
            )}

            <button type="submit" className="auth-button">
              Send Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <div className="resend-code">Didn't get the code?</div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button">
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;