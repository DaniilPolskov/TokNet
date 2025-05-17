import React, { useState } from 'react';

const TwoFactorForm = ({ email, password, onLogin, setError, setShowToast, navigate }) => {
  const [code, setCode] = useState('');

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, code }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error();

      localStorage.setItem('access_token', data.access);
      setShowToast(true);
      setTimeout(() => {
        onLogin({ email, token: data.access });
        navigate('/profile');
      }, 2500);
    } catch {
      setError('Invalid 2FA code');
    }
  };

  return (
    <form onSubmit={handle2FASubmit}>
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
      <button type="submit" className="auth-button">Confirm 2FA</button>
    </form>
  );
};

export default TwoFactorForm;