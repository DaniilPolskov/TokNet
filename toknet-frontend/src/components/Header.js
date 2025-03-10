import React from 'react';
import './styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">TokNet</div>
      <nav className="nav">
        <a href="/" className="nav-link">Home</a>
        <a href="/swap" className="nav-link">Swap</a>
        <a href="/tokens" className="nav-link">Tokens</a>
        <a href="/about" className="nav-link">About</a>
      </nav>
    </header>
  );
};

export default Header;