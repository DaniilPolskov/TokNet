import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './styles/Header.css';
import exchangeIcon from '../assets/Logo.png';

const Header = ({ isAuthenticated, user, onLogout, children }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src={exchangeIcon} alt="Logo" className="logo-image" />
        </div>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/exchange" className="nav-link">Exchange</Link>
          <Link to="/rates" className="nav-link">Rates</Link>
          <Link to="/technical-support" className="nav-link">Support</Link>

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
                    <button onClick={onLogout} className="logout-button dropdown-link">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/singup" className="nav-link sign-up">Sign up</Link>
          )}
        </nav>
      </header>

    </>
  );
};

export default Header;
