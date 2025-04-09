import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Header.css';

const Header = ({ isAuthenticated, user, onLogout }) => {
  return (
    <header className="header">
      <div className="logo">TokNet</div>
      <nav className="nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/swap" className="nav-link">Swap</Link>
        <Link to="/tokens" className="nav-link">Tokens</Link>
        <Link to="/about" className="nav-link">About</Link>
        {isAuthenticated ? (
          <div className="user-info">
            <span>Welcome, {user?.email || user?.username || 'User'}</span>
            <button onClick={onLogout} className="auth-button">Logout</button>
          </div>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
