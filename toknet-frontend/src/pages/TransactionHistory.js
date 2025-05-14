import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // Импортируем useNavigate
import "./styles/Profile.css";
import axios from "axios";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [sortOption, setSortOption] = useState("date_desc");

  const navigate = useNavigate();  // Инициализируем navigate

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/exchange/history/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions", error);
      }
    };

    fetchTransactions();
  }, []);

  const toggleSort = (field) => {
    if (field === "date") {
      setSortOption((prev) =>
        prev === "date_desc" ? "date_asc" : "date_desc"
      );
    } else if (field === "amount") {
      setSortOption((prev) =>
        prev === "amount_desc" ? "amount_asc" : "amount_desc"
      );
    } else {
      setSortOption("status");
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    switch (sortOption) {
      case "date_desc":
        return new Date(b.created_at) - new Date(a.created_at);
      case "date_asc":
        return new Date(a.created_at) - new Date(b.created_at);
      case "amount_desc":
        return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
      case "amount_asc":
        return parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const handleProfileClick = () => {
    navigate('/profile');  // Используем navigate для перехода на профиль
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="close-button" onClick={handleProfileClick}>
          &lt;  {/* Это будет кнопка для возврата на страницу профиля */}
        </button>
        <h2 className="section-title">Transaction History</h2>
      </div>

      <div className="transaction-filters">
        <button
          className={`filter-button ${
            sortOption.includes("date") ? "active" : ""
          }`}
          onClick={() => toggleSort("date")}
        >
          Date {sortOption === "date_desc" ? "↓" : "↑"}
        </button>

        <button
          className={`filter-button ${
            sortOption.includes("amount") ? "active" : ""
          }`}
          onClick={() => toggleSort("amount")}
        >
          Amount {sortOption === "amount_desc" ? "↓" : "↑"}
        </button>

        <button
          className={`filter-button ${sortOption === "status" ? "active" : ""}`}
          onClick={() => toggleSort("status")}
        >
          Status
        </button>
      </div>

      <div className="transaction-header">
        <div>Order ID</div>
        <div>From</div>
        <div>To</div>
        <div>Amount</div>
        <div>Rate</div>
        <div className="details-column-header">Details</div>
      </div>

      {sortedTransactions.map((order) => (
        <div className="transaction-row" key={order.order_id}>
          <div>{order.order_id}</div>
          <div>{order.from_currency}</div>
          <div>{order.to_currency}</div>
          <div>{order.amount}</div>
          <div>{order.rate}</div>
          <div className="details-column" style={{ fontFamily: "Urbanist", fontSize: "16px" }}>
            <div>
              <strong>Fee:</strong> {order.fee}%
            </div>
            <div>
              <strong>Status:</strong> {order.status}
            </div>
            <div>
              <strong>Receive:</strong> {order.receive_amount}
            </div>
            <div>
              <strong>Created:</strong>{" "}
              {new Date(order.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}

      {sortedTransactions.length === 0 && (
        <div className="no-transactions">No transactions found.</div>
      )}
    </div>
  );
};

export default TransactionsPage;