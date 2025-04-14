import React from 'react';
import './styles/Homepage.css';

export default function HomePage() {
  return (
    <div className="homepage">
      <section className="main-banner">
        <h1>Exchange Your</h1> 
        <h1>Crypto Easily</h1>
        <p>Sign up now and start exchanging your favorite </p> 
        <p>cryptocurrencies.</p>
        <button className="start-btn">Get Started</button>
      </section>

      <div className="exchange-box">
        <div className="exchange-row">
          <span className="crypto">BTC</span>
          <span className="arrow">⇄</span>
          <span className="crypto">USDT</span>
        </div>
        <div className="exchange-values">
          <div>
            <p className="value">0.5 BTC</p>
            <p className="label">You pay</p>
          </div>
          <div>
            <p className="value">41654,58 USDT</p>
            <p className="label">You receive</p>
          </div>
        </div>
        <p className="rate">Exchange Rate 1 BTC ≈ 83,309 USDT</p>
      </div>

      <section className="buttom-banners">
        <div className="buttom-banner">
          <h3>Competitive Rates</h3>
          <p>We offer competitive exchange rates for various cryptocurrencies.</p>
        </div>
        <div className="buttom-banner">
          <h3>Competitive Rates</h3>
          <p>Exchange your crypto quickly and securely with our platform.</p>
        </div>
        <div className="buttom-banner">
          <h3>Fast Transactions</h3>
          <p>Exchange your crypto quickly and securely with our platform.</p>
        </div>
        <div className="buttom-banner">
          <h3>24/7 Support</h3>
          <p>Our support team is available 24/7 to assist you with any issues.</p>
        </div>
      </section>
    </div>
  );
}
