import React from "react";
import './styles/Profile.css';

const Profile = () => {
  return (
    <>
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar">
            <span className="avatar-text">?</span>
          </div>

          <div className="user-info">
            <div className="user-info-container">

              <div className="info-block">
                <h2 className="username">TokNetLover</h2>
              </div>

              <div className="info-block">
                <span className="status-indicator">● Online status</span>
              </div>

              <div className="info-block">
                <span className="location">New York, USA</span>
              </div>

              <div className="info-block token-list">
                <span className="token-badge token-btc">BTC</span>
                <span className="token-badge token-eth">ETH</span>
              </div>

            </div>
          </div>

          <div className="stats-container">
            <div className="stat-block">
              <div className="stat-number">1653</div>
              <div className="stat-label">Transaction count</div>
            </div>
            <div className="stat-block">
              <div className="stat-number">4</div>
              <div className="stat-label">Lot quantity</div>
            </div>
          </div>
        </div>

        <div className="wallet-section">
          <div className="wallet-header">
            <h3 className="wallet-title">Your wallet:</h3>
            <button className="view-all-button">View all</button>
          </div>
          <div className="wallet-cards">
            <div className="wallet-card">
              <div className="currency-name">Ripple (XRP)</div>
              <div className="currency-balance">69.236967</div>
              <div className="pnl positive">+0.09% PnL</div>
            </div>

            <div className="wallet-card">
              <div className="currency-name">Ethereum (ETH)</div>
              <div className="currency-balance">0.650848452</div>
              <div className="pnl negative">-3.9% PnL</div>
            </div>

            <div className="wallet-card">
              <div className="currency-name">USD Coin (USDC)</div>
              <div className="currency-balance">19</div>
              <div className="pnl neutral">+0.00% PnL</div>
            </div>

            <div className="wallet-card">
              <div className="currency-name">Bitcoin (BTC)</div>
              <div className="currency-balance">0.0001558</div>
              <div className="pnl positive">+0.2% PnL</div>
            </div>
          </div>
        </div>
      </div>

      <div className="actions-section-container">
        <div className="actions-section">
          <button className="action-button">Edit profile</button>
          <button className="action-button">History</button>
          <button className="action-button">Level</button>
          <button className="action-button">FAQ</button>
        </div>
      </div>
    </>
  );
};

export default Profile;
