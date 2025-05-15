import React, { useState } from 'react';
import './styles/Profile.css';
import { useNavigate } from 'react-router-dom';

const faqData = [
    {
      type: "warning",
      question: "⚠️ Risk warning when using the crypto exchange",
      answer: "Cryptocurrency transactions carry risks of fund loss due to market volatility, technical failures, or third-party actions. We do not guarantee profits and are not responsible for users’ financial losses."
    },
    {
      type: "compliance",
      question: "📄 What is the KYC (Know Your Customer) policy?",
      answer: "KYC is a mandatory procedure for verifying a customer's identity. You must provide an identity document and, if necessary, proof of address. This is required to prevent fraud and ensure transparency of operations."
    },
    {
      type: "compliance",
      question: "🛡️ What is the AML (Anti-Money Laundering) policy?",
      answer: "AML aims to prevent money laundering, terrorism financing, and illegal transactions. All transactions may be monitored, and if suspicious activity is detected, your account may be temporarily frozen pending investigation."
    },
    {
      type: "security",
      question: "🔐 How to protect your account?",
      answer: "— Use a unique, strong password\n— Enable two-factor authentication (2FA)\n— Never share your login/password\n— Always check the website address before logging in"
    },
    {
      type: "compliance",
      question: "📁 What documents are required for verification?",
      answer: "For KYC, you may need: passport or ID card, selfie with the document, proof of address (e.g., utility bill, bank statement). Documents must be readable and valid."
    },
    {
      type: "usage",
      question: "💸 Why is my transaction delayed?",
      answer: "Possible reasons:\n— Manual processing (e.g., large volume exchange)\n— Network congestion\n— Additional verification required\n— Your operation was flagged as suspicious according to AML"
    },
    {
      type: "usage",
      question: "🔁 Can I cancel a sent transaction?",
      answer: "No. Cryptocurrency transactions are irreversible. Always double-check addresses and amounts before confirming."
    },
    {
      type: "security",
      question: "🧠 How to avoid fraud?",
      answer: "— Do not click suspicious links\n— Do not trust promises of quick profits\n— We will never ask for your password or seed phrase\n— Use antivirus and keep software up to date"
    },
    {
        type: "usage",
        question: "🎯 How does the level system and fee reduction work?",
        answer: (
          <div>
            Our platform uses a level system to reward active users. Here’s how it works:
            <br /><br />
            <strong>— Level 1:</strong> Beginner — standard fee<br />
            <strong>— Level 2:</strong> Verified user — <span style={{ color: 'green' }}>-5%</span> off base fee<br />
            <strong>— Level 3:</strong> Experienced trader — <span style={{ color: 'green' }}>-10%</span><br />
            <strong>— Level 4:</strong> Partner — <span style={{ color: 'green' }}>-15%</span><br />
            <strong>— Level 5:</strong> VIP — <em>individual terms</em><br /><br />
            
            <strong>Level upgrades depend on:</strong><br />
            — Total transaction volume<br />
            — Compliance with rules (no AML violations)<br /><br />
      
            <strong>The level is shown in your profile.</strong>
          </div>
        )
      }
  ];


const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleBackToProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="profile-container">
      <button className="close-button" onClick={handleBackToProfile}>
        &lt;
      </button>

      <h2 className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqData.map((item, index) => (
          <div className="faq-item" key={index}>
            <button className="faq-question" onClick={() => toggleAnswer(index)}>
              {item.question}
              <span className="faq-arrow">{openIndex === index ? '▲' : '▼'}</span>
            </button>
            {openIndex === index && (
              <div className="faq-answer">
                {typeof item.answer === 'string' ? item.answer : item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;