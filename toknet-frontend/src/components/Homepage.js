import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/Homepage.css';
import btcIcon from '../icons/btc.svg';
import ethIcon from '../icons/eth.svg';
import usdtIcon from '../icons/usdt.svg';

export default function HomePage() {
  const [fromCrypto, setFromCrypto] = useState('BTC');
  const [toCrypto, setToCrypto] = useState('USDT');
  const [cryptoData, setCryptoData] = useState({});
  const [exchangeRate, setExchangeRate] = useState(null);
  const [amount, setAmount] = useState(1);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const navigate = useNavigate();
  
  const availableCryptos = [
    { symbol: 'BTC', name: 'Bitcoin', icon: btcIcon },
    { symbol: 'ETH', name: 'Ethereum', icon: ethIcon },
    { symbol: 'USDT', name: 'Tether', icon: usdtIcon },
  ];

  useEffect(() => {
    const fetchData = () => {
      axios.get('http://localhost:8000/api/crypto-data/')
        .then(res => {
          const data = res.data.reduce((acc, curr) => {
            acc[curr.symbol] = curr;
            return acc;
          }, {});
          setCryptoData(data);
        })
        .catch(err => console.error('Failed to fetch crypto data:', err));
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (cryptoData[fromCrypto] && cryptoData[toCrypto]) {
      const fromPrice = cryptoData[fromCrypto].price;
      const toPrice = cryptoData[toCrypto].price;
      const rate = fromPrice / toPrice;
      setExchangeRate(rate);
    }
  }, [cryptoData, fromCrypto, toCrypto]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setAmount(sanitizedValue);
  };

  return (
    <div className="homepage">
      <section className="main-banner">
        <h1>Exchange&nbsp; Your</h1>
        <h1>Crypto Easily</h1>
        <p>Sign up now and start exchanging your favorite cryptocurrencies.</p>
        <div style={{ textAlign: 'center' }}>
          <button className="start-btn" onClick={() => navigate('/login')}>
            Get Started
          </button>
        </div>
      </section>

      <div className="exchange-box">
        <div className="crypto-select-container">
          <div className="crypto-select" onClick={() => setShowFromDropdown(prev => !prev)}>
            <img src={availableCryptos.find(crypto => crypto.symbol === fromCrypto).icon} alt={fromCrypto} className="crypto-icon" />
            <span className="crypto-label">{fromCrypto}</span>
            <span className="dropdown-arrow">▾</span>
            {showFromDropdown && (
              <div className="dropdown-list">
                {availableCryptos.map((crypto) => (
                  <div
                    key={crypto.symbol}
                    className="dropdown-item"
                    onClick={() => {
                      setFromCrypto(crypto.symbol);
                      setShowFromDropdown(false);
                    }}
                  >
                    <img src={crypto.icon} alt={crypto.symbol} className="crypto-icon" />
                    <span className="crypto-label">{crypto.symbol}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="switch-button" onClick={() => {
            const temp = fromCrypto;
            setFromCrypto(toCrypto);
            setToCrypto(temp);
          }}>
            <span className="switch-icon">⇄</span>
          </div>

          <div className="crypto-select" onClick={() => setShowToDropdown(prev => !prev)}>
            <img src={availableCryptos.find(crypto => crypto.symbol === toCrypto).icon} alt={toCrypto} className="crypto-icon" />
            <span className="crypto-label">{toCrypto}</span>
            <span className="dropdown-arrow">▾</span>
            {showToDropdown && (
              <div className="dropdown-list">
                {availableCryptos.map((crypto) => (
                  <div
                    key={crypto.symbol}
                    className="dropdown-item"
                    onClick={() => {
                      setToCrypto(crypto.symbol);
                      setShowToDropdown(false);
                    }}
                  >
                    <img src={crypto.icon} alt={crypto.symbol} className="crypto-icon" />
                    <span className="crypto-label">{crypto.symbol}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="exchange-values">
          <div className="input-box">
            <div className="crypto-info">
              <img src={availableCryptos.find(crypto => crypto.symbol === fromCrypto).icon} alt={fromCrypto} className="crypto-icon" />
              <span className="crypto-symbol">{fromCrypto}</span>
            </div>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="crypto-input"
              placeholder="0.00"
            />
            <p className="label">You pay</p>
          </div>
          <div className="input-box">
            <div className="crypto-info">
              <img src={availableCryptos.find(crypto => crypto.symbol === toCrypto).icon} alt={toCrypto} className="crypto-icon" />
              <span className="crypto-symbol">{toCrypto}</span>
            </div>
            <div className="crypto-output">
              {exchangeRate ? (amount * exchangeRate).toFixed(2) : '...'}
            </div>
            <p className="label">You receive</p>
          </div>
        </div>

        <div className="exchange-rate">
          <p className="exchange-rate-label">Exchange Rate:</p>
          <p className="exchange-rate-value">
            1 {fromCrypto} ≈ {exchangeRate ? exchangeRate.toFixed(6) : '...'} {toCrypto}
          </p>
        </div>
      </div>

      <section className="buttom-banners">
        <div className="buttom-banner">
          <h3>Competitive Rates</h3>
          <p>We offer competitive exchange rates for various cryptocurrencies.</p>
        </div>
        <div className="buttom-banner">
          <h3>Secure Exchange</h3>
          <p>Exchange your crypto quickly and securely with our platform.</p>
        </div>
        <div className="buttom-banner">
          <h3>Fast Transactions</h3>
          <p>Get your coins delivered instantly with minimal fees.</p>
        </div>
        <div className="buttom-banner">
          <h3>24/7 Support</h3>
          <p>Our team is here to help you around the clock.</p>
        </div>
      </section>
    </div>
  );
}
