import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import './styles/Header.css';
import exchangeIcon from '../assets/Logo.png';

const Header = ({ isAuthenticated, user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src={exchangeIcon} alt="Logo" className="logo-image" />
        </div>

        <div
          className={`menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        ></div>

        <nav className={`nav ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
          <Link to="/exchange" className="nav-link" onClick={closeMobileMenu}>Exchange</Link>
          <Link to="/rules" className="nav-link" onClick={closeMobileMenu}>Rules</Link>
          <Link to="/technical-support" className="nav-link" onClick={closeMobileMenu}>Support</Link>

          {isAuthenticated ? (
            <div
              className="profile-menu"
              onMouseEnter={() => !mobileMenuOpen && setShowDropdown(true)}
              onMouseLeave={() => !mobileMenuOpen && setShowDropdown(false)}
            >
              <FaUserCircle className="profile-icon" />
              {(showDropdown || mobileMenuOpen) && (
                <div className="dropdown">
                  <span className="dropdown-user">{user?.email || 'User'}</span>
                  <Link to="/profile" className="dropdown-link" onClick={closeMobileMenu}>My Profile</Link>
                  <button
                    onClick={() => {
                      onLogout();
                      closeMobileMenu();
                    }}
                    className="logout-button dropdown-link"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className="sign-up-menu"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <Link to="/login" className="nav-link sign-up">Sign in</Link>
              {showDropdown && (
                <div className="sign-up-dropdown">
                  <Link to="/register" className="nav-link sign-up">Sign up</Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>
    </>
  );
};

export default Header;
