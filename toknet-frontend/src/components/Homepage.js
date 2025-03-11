import React, { useState, useEffect } from 'react';
import './styles/Homepage.css';

const Homepage = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [cryptoData, setCryptoData] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/crypto-data/');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setCryptoData(data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching crypto data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="homepage">
      <div className="content-container">
        <div className="swap-form">
          <h2>Swap Tokens</h2>
          <div className="form-group">
            <label>From:</label>
            <select value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
              {cryptoData.map((crypto) => (
                <option key={crypto.symbol} value={crypto.symbol}>
                  {crypto.name} ({crypto.symbol})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Amount:</label>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.0"
              inputMode="numeric"
            />
          </div>
          <div className="form-group">
            <label>To:</label>
            <select value={toToken} onChange={(e) => setToToken(e.target.value)}>
              {cryptoData.map((crypto) => (
                <option key={crypto.symbol} value={crypto.symbol}>
                  {crypto.name} ({crypto.symbol})
                </option>
              ))}
            </select>
          </div>
          <button className="swap-button">Swap Now</button>
        </div>

        <div className="price-list">
          <h3>Current Prices</h3>
          <ul>
            {cryptoData.map((crypto) => {
              const isPositive = crypto.price_change_24h > 0;
              const isNegative = crypto.price_change_24h < 0;

              return (
                <li key={crypto.symbol}>
                  <span className="crypto-name">{crypto.name} ({crypto.symbol})</span>
                  <span className={`crypto-price ${isPositive ? 'positive' : isNegative ? 'negative' : ''}`}>
                    ${crypto.price.toFixed(2)}
                    <span className="price-change">
                      {isPositive && ' ▲ '}
                      {isNegative && ' ▼ '}
                      {crypto.price_change_24h.toFixed(2)}%
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Homepage;