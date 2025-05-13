import React, { useEffect, useState } from "react";
import "./styles/Profile.css";
import axios from 'axios';
const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredType, setFilteredType] = useState("All");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/api/transactions/'); 
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions", error);
      }
    };

    fetchTransactions();
  }, []);

  const types = ["All", "Deposit", "Withdrawal", "Trade"];

  const filteredTransactions =
    filteredType === "All"
      ? transactions
      : transactions.filter((tx) => tx.type === filteredType);

  return (
    <div className="profile-container">
      <h2 className="section-title">Transaction History</h2>

      <div className="transaction-filters">
        {types.map((type) => (
          <button
            key={type}
            className={`filter-button ${filteredType === type ? "active" : ""}`}
            onClick={() => setFilteredType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="transaction-header">
        <div className="transaction-label">Type</div>
        <div className="transaction-label">Amount</div>
        <div className="transaction-label">Date</div>
        <div className="transaction-label">Status</div>
        <div className="transaction-label">Note</div>
      </div>

      {filteredTransactions.map((tx) => (
        <div className="transaction-row-data" key={tx.id}>
          <div className="transaction-cell">{tx.type}</div>
          <div className="transaction-cell">{tx.amount} {tx.currency}</div>
          <div className="transaction-cell">{new Date(tx.timestamp).toLocaleString()}</div>
          <div className="transaction-cell">{tx.status}</div>
          <div className="transaction-cell">{tx.note}</div>
        </div>
      ))}

      {filteredTransactions.length === 0 && (
        <div className="no-transactions">No transactions found for this type.</div>
      )}
    </div>
  );
};

export default TransactionsPage;