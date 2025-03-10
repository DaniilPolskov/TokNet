import React, { useState } from 'react';
import './styles/Homepage.css';

const SwapForm = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('BTC');
  const [amount, setAmount] = useState('');

  // Функция для валидации ввода (только цифры)
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Проверяем, что введены только цифры
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSwap = () => {
    console.log(`Swapping ${amount} ${fromToken} to ${toToken}`);
  };

  return (
    <div className="swap-form">
      <h2>Swap Tokens</h2>
      <div className="form-group">
        <label>From:</label>
        <select value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
          <option value="ETH">ETH</option>
          <option value="BTC">BTC</option>
          <option value="USDT">USDT</option>
        </select>
      </div>
      <div className="form-group">
        <label>Amount:</label>
        <input
          type="text" // Используем type="text" для кастомной валидации
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.0"
          inputMode="numeric" // Показываем цифровую клавиатуру на мобильных устройствах
        />
      </div>
      <div className="form-group">
        <label>To:</label>
        <select value={toToken} onChange={(e) => setToToken(e.target.value)}>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
        </select>
      </div>
      <button className="swap-button" onClick={handleSwap}>Swap Now</button>
    </div>
  );
};

export default SwapForm;