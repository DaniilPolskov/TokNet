import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './styles/Header.css';

const Header = ({ isAuthenticated, user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="header">
      <div className="logo">TokNet</div>
      <nav className="nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/exchange" className="nav-link">Exchange</Link>
        <Link to="/rates" className="nav-link">Rates</Link>
        <Link to="/support" className="nav-link">Support</Link>

        {isAuthenticated ? (
          <div
            className="profile-menu"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <FaUserCircle className="profile-icon" />
            {showDropdown && (
              <div className="dropdown">
                <span className="dropdown-user">{user?.email || 'User'}</span>
                <Link to="/profile" className="dropdown-link">My Profile</Link>
                <button onClick={onLogout} className="dropdown-link logout-button">Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/singup" className="nav-link">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
