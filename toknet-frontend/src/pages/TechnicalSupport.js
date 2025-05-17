import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import './styles/TechnicalSupport.css';

const TechnicalSupport = () => {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason || !message || !userEmail) {
      alert('Please fill all fields');
      return;
    }

    const templateParams = {
      user_email: userEmail,
      title: reason,
      message: message
    };

    emailjs.send(
      'service_pcbkzth',
      'template_emhnqmn',
      templateParams,
      'YUlOL2-JAv1x39kE8'
    ).then(() => {
      setShowToast(true);
      setReason('');
      setMessage('');
      setUserEmail('');
      setTimeout(() => setShowToast(false), 3000);
    }).catch((err) => {
      console.error('Email send error:', err);
      alert('Failed to send the message. Please try again.');
    });
  };

  return (
    <div className="support-wrapper">
      <form className="support-box" onSubmit={handleSubmit}>
        <h2 className="support-title">Contact Support</h2>

        <label>Email</label>
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="Your email"
          required
        />

        <label>Reason</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} required>
          <option value="">Select reason</option>
          <option value="Payment issue">Payment issue</option>
          <option value="Funds not received">Funds not received</option>
          <option value="Website error">Website error</option>
          <option value="Other">Other</option>
        </select>

        <label className="support-label">Message</label>
        <textarea
          className="support-text"
          rows="6"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue..."
          required
        />

        <button type="submit" className="submit-support-btn">
          Send
        </button>
      </form>

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
          <span className="success-message">Message sent!</span>
        </div>
      )}
    </div>
  );
};

export default TechnicalSupport;
