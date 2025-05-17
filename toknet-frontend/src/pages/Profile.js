import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './styles/Profile.css';

const levelsData = [
  { level: 'LVL 0', volume: 0, swap: '2%' },
  { level: 'LVL 1', volume: 100, swap: '1.5%' },
  { level: 'LVL 2', volume: 1000, swap: '1.45%' },
  { level: 'LVL 3', volume: 3000, swap: '1.4%' },
  { level: 'LVL 4', volume: 50000, swap: '1.35%' },
  { level: 'LVL 5', volume: 100000, swap: '1.3%' },
];

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receivedCount, setReceivedCount] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Please login to access this page');

        const profileResponse = await axios.get('http://localhost:8000/api/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser(profileResponse.data);

        const txResponse = await axios.get('http://localhost:8000/api/exchange/history/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const receivedTransactions = txResponse.data.filter(tx => tx.status === 'received');
        setReceivedCount(receivedTransactions.length);

        let total = 0;
        receivedTransactions.forEach((tx) => {
          const from = tx.from_currency?.toUpperCase();
          const to = tx.to_currency?.toUpperCase();
          if (from === 'USDT') total += parseFloat(tx.amount) || 0;
          else if (to === 'USDT') total += parseFloat(tx.receive_amount) || 0;
        });

        const level = calculateUserLevel(total);
        setUserLevel(level);
      } catch (err) {
        console.error('Profile load error:', err);
        setError(err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const calculateUserLevel = (total) => {
    for (let i = levelsData.length - 1; i >= 0; i--) {
      if (total >= levelsData[i].volume) return i;
    }
    return 0;
  };

  const handleEditClick = () => navigate('/profile/edit');
  const handleHistoryClick = () => navigate('/profile/transactions');
  const handleLevelClick = () => navigate('/profile/level');
  const handleFaqClick = () => navigate('/profile/faq');

  if (loading) {
    return (
      <div className="profile-container">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h3>Profile Error</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()}>Retry</button>
            <button onClick={() => navigate('/login')}>Login</button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-empty">
          <p>No profile data available</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-preview">
          {user.profile_picture ? (
            <img
              src={user.profile_picture || '/images/default.svg'}
              alt="avatar"
              className="avatar-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default.svg';
              }}
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

            {user.show_location && user.address && (
              <div className="info-block">
                <span className="location">{user.address}</span>
              </div>
            )}

            <div className="info-block">
              <span><strong>Enable 2FA:</strong> {user.is_2fa_enabled ? 'Yes' : 'No'}</span>
            </div>

            <div className="info-block">
              <span><strong>Completed KYC:</strong> {user.kyc_submitted ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="stats-container">
          <div className="stat-block">
            <div className="stat-number">{receivedCount}</div>
            <div className="stat-label">Transactions</div>
          </div>
          <div className="stat-block">
            <div className="stat-number">LVL {userLevel}</div>
            <div className="stat-label">Your level</div>
          </div>
        </div>
      </div>

      <div className="actions-section-container">
        <div className="actions-section">
          <button className="action-button" onClick={handleEditClick}>
            {isMobile ? 'Edit' : 'Edit profile'}
          </button>
          <button className="action-button" onClick={handleHistoryClick}>
            {isMobile ? 'History' : 'History'}
          </button>
          <button className="action-button" onClick={handleLevelClick}>
            {isMobile ? 'Level' : 'Level'}
          </button>
          <button className="action-button" onClick={handleFaqClick}>
            FAQ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;