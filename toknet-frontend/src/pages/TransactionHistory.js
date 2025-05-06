import React, { useEffect, useState } from "react";
import "./styles/Profile.css";

const mockTransactions = [
  { id: 1, type: "Deposit", amount: 250, currency: "USDT", timestamp: "2025-05-05T12:00:00Z", status: "Completed", note: "Bank transfer" },
  { id: 2, type: "Withdrawal", amount: 50, currency: "BTC", timestamp: "2025-05-04T15:30:00Z", status: "Pending", note: "To external wallet" },
  { id: 3, type: "Trade", amount: 100, currency: "ETH", timestamp: "2025-05-03T10:15:00Z", status: "Completed", note: "Bought ETH with USDT" },
  { id: 4, type: "Deposit", amount: 500, currency: "USDT", timestamp: "2025-05-01T09:00:00Z", status: "Completed", note: "Card deposit" },
];

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredType, setFilteredType] = useState("All");

  useEffect(() => {
    setTransactions(mockTransactions);
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
