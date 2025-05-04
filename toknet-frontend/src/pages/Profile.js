import React, { useEffect, useState } from "react";
import './styles/Profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/profile/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text(); 
          console.error('Error response:', text);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => console.error('Fetch error:', err));
  }, []);

  const handleEditClick = () => {
    navigate('/profile/edit');
  };

  if (!user) return <div>Loading...</div>;
  return (
    <>
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="avatar"
                className="avatar-img"
              />
            ) : (
              <span className="avatar-text">?</span>
            )}
          </div>

          <div className="user-info">
            <div className="user-info-container">
              <div className="info-block">
                <h2 className="username">{user.username}</h2>
              </div>

              <div className="info-block">
                <span className="status-indicator">● Online status</span>
              </div>

              {user.show_location && user.address && (
                <div className="info-block">
                  <span className="location">{user.address}</span>
                </div>
              )}

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
          <button className="action-button" onClick={handleEditClick}>
            Edit profile
          </button>
          <button className="action-button">History</button>
          <button className="action-button">Level</button>
          <button className="action-button">FAQ</button>
        </div>
      </div>
    </>
  );
};

export default Profile;