import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          throw new Error('Please login to access this page');
        }

        const profileResponse = await axios.get('http://localhost:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!profileResponse.data) {
          throw new Error('No profile data received');
        }

        setUser(profileResponse.data);

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

  const handleEditClick = () => {
    navigate('/profile/edit');
  };

  const handleHistoryClick = () => {
    navigate('/profile/transactions');
  };

  const handleLevelClick = () => {
    navigate('/profile/level');
  };

  const handleFaqClick = () => {
    navigate('/profile/faq');
  };

  const formatBirthdate = (dateStr, showDayMonth, showYear) => {
    const date = new Date(dateStr);
    const options = {
      day: showDayMonth ? '2-digit' : undefined,
      month: showDayMonth ? 'short' : undefined,
      year: showYear ? 'numeric' : undefined,
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getPnlClass = (change) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

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

            <div className="info-block">
            <div className="rating-level">
              <span className="rating">
                Rating: {"★".repeat(Math.round(user.rating || 0)).padEnd(5, "☆")}
              </span>
              </div>
            </div>

            {user.show_location && user.address && (
              <div className="info-block">
                <span className="location">{user.address}</span>
              </div>
            )}

          </div>
        </div>

        <div className="stats-container">
          <div className="stat-block">
            <div className="stat-number">{user.transaction_count ?? 0}</div>
            <div className="stat-label">Transaction count</div>
          </div>
          <div className="stat-block">
            <div className="stat-number">{user.lot_quantity ?? 0}</div>
            <div className="stat-label">Lot quantity</div>
          </div>
        </div>
      </div>

      <div className="actions-section-container">
        <div className="actions-section">
          <button className="action-button" onClick={handleEditClick}>
            Edit profile
          </button>
          <button className="action-button" onClick={handleHistoryClick}>
            History
          </button>
          <button className="action-button" onClick={handleLevelClick}>
            Level
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