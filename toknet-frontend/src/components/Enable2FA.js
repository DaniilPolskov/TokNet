import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/Enable2FA.css";

const Enable2FA = () => {
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You are not authorized.");
        navigate("/login");
        return;
      }

      try {
        const profile = await axios.get("http://localhost:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIs2FAEnabled(profile.data.is_2fa_enabled);

        if (!profile.data.is_2fa_enabled) {
          const response = await axios.get("http://localhost:8000/api/2fa/setup/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setQrCodeUrl(response.data.qr_code_url);
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Failed to load data.");
      }
    };

    fetchData();
  }, [navigate]);

  const handleEnable = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("You are not authorized.");

    try {
      await axios.post(
        "http://localhost:8000/api/2fa/verify/",
        { code: otpCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("2FA successfully enabled!");
      navigate("/profile/edit/");
    } catch (err) {
      alert("Invalid code, please try again.");
    }
  };

  const handleDisable = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("You are not authorized.");

    try {
      await axios.post(
        "http://localhost:8000/api/2fa/disable/",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("2FA disabled.");
      window.location.reload();
    } catch (err) {
      alert("Error disabling 2FA.");
    }
  };

  return (
    <div className="enable-2fa-container">
      <div className="enable-2fa-card">
        <h2>{is2FAEnabled ? "2FA Management" : "Enable Two-Factor Authentication"}</h2>

        {is2FAEnabled ? (
          <>
            <p>2FA is already enabled.</p>
            <button className="disable-button" onClick={handleDisable}>
              Disable 2FA
            </button>
          </>
        ) : (
          <>
            <p>Scan the QR code in an app (e.g., Google Authenticator):</p>
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="qr-code-img" />
            ) : (
              <p>Loading QR code...</p>
            )}

            <div className="form-block">
              <label>Enter the code from the app</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="6-digit code"
              />
            </div>

            <button className="enable-button" onClick={handleEnable}>
              Confirm and enable 2FA
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Enable2FA;