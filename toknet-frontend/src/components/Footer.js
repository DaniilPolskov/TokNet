import React from 'react';
import './styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">&copy; 2025 TokNet. All rights reserved.</p>
        <nav className="footer-nav">
          <a href="/privacy" className="footer-link">Privacy Policy</a>
          <a href="/terms" className="footer-link">Terms of Service</a>
          <a href="/support" className="footer-link">Support</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;