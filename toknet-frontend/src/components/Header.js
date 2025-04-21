import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';  // Для иконки пользователя
import './styles/Header.css';
import exchangeIcon from '../assets/Logo.png'; // Импортируйте логотип из assets

const Header = ({ isAuthenticated, user, onLogout, children }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
      <header className="header">
        <div className="logo">
          {/* Используем картинку из assets */}
          <img src={exchangeIcon} alt="Logo" className="logo-image" />
        </div>
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
            <Link to="/singup" className="nav-link sign-up">Sign up</Link>
          )}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">TokNet</div>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-copy">© {new Date().getFullYear()} TokNet. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
};

export default Header;
