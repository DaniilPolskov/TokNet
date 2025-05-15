import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/OrderCancelled.css';

export default function OrderCancelled() {
  const navigate = useNavigate();

  return (
    <div className="cancelled-wrapper">
      <div className="cancelled-box">
        <h2>Order Cancelled</h2>
        <p>If you have any further questions, please contact support</p>
        <button
          className="support-btn"
          onClick={() => window.open('/technical-support', '_blank')}
        >
        Contact Support
        </button>
        <button className="back-btn" onClick={() => navigate('/')}>
        Return to Homepage
        </button>
      </div>
    </div>
  );
}
