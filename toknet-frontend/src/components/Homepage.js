import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/Homepage.css';

export default function HomePage() {
  const [fromCrypto, setFromCrypto] = useState('BTC');
  const [toCrypto, setToCrypto] = useState('USDT');
  const [cryptoData, setCryptoData] = useState({});
  const [exchangeRate, setExchangeRate] = useState(null);

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

  return (
    <div className="homepage">
      <section className="main-banner">
        <h1>Exchange&nbsp; Your</h1> 
        <h1>Crypto Easily</h1>
        <p>Sign up now and start exchanging your favorite cryptocurrencies.</p>
        <div style={{ textAlign: 'center' }}>
          <button className="start-btn">Get Started</button>
        </div>
      </section>

      <div className="exchange-box">
        <div className="exchange-row">
          <select value={fromCrypto} onChange={e => setFromCrypto(e.target.value)}>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
          </select>
          <span className="arrow">⇄</span>
          <select value={toCrypto} onChange={e => setToCrypto(e.target.value)}>
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </select>
        </div>

        <div className="exchange-values">
          <div>
            <p className="value">0.5 {fromCrypto}</p>
            <p className="label">You pay</p>
          </div>
          <div>
            <p className="value">
              {exchangeRate ? (0.5 * exchangeRate).toFixed(2) : '...'} {toCrypto}
            </p>
            <p className="label">You receive</p>
          </div>
        </div>
        <p className="rate">
          Exchange Rate 1 {fromCrypto} ≈ {exchangeRate ? exchangeRate.toFixed(6) : '...'} {toCrypto}
        </p>
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
