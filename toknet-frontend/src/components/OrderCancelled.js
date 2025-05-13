import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/OrderCancelled.css';

export default function OrderCancelled() {
  const navigate = useNavigate();

  return (
    <div className="cancelled-wrapper">
      <div className="cancelled-box">
        <h2>Ордер отменён</h2>
        <p>Если у вас остались дополнительные вопросы, обратитесь в поддержку</p>
        <button
          className="support-btn"
          onClick={() => window.open('/support', '_blank')}
        >
        Обратиться в поддержку
        </button>
        <button className="back-btn" onClick={() => navigate('/')}>
        Вернуться на главную
        </button>
      </div>
    </div>
  );
}
