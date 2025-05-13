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
        alert("Вы не авторизованы.");
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
        console.error("Ошибка:", err);
        alert("Ошибка загрузки данных.");
      }
    };

    fetchData();
  }, [navigate]);

  const handleEnable = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Вы не авторизованы.");

    try {
      await axios.post(
        "http://localhost:8000/api/2fa/verify/",
        { code: otpCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("2FA успешно включена!");
      navigate("/profile/edit/");
    } catch (err) {
      alert("Неверный код, попробуйте снова.");
    }
  };

  const handleDisable = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Вы не авторизованы.");

    try {
      await axios.post(
        "http://localhost:8000/api/2fa/disable/",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("2FA отключена.");
      window.location.reload();
    } catch (err) {
      alert("Ошибка при отключении 2FA.");
    }
  };

  return (
    <div className="enable-2fa-container">
      <div className="enable-2fa-card">
        <h2>{is2FAEnabled ? "Управление 2FA" : "Включение двухфакторной аутентификации"}</h2>

        {is2FAEnabled ? (
          <>
            <p>2FA уже включена.</p>
            <button className="disable-button" onClick={handleDisable}>
              Отключить 2FA
            </button>
          </>
        ) : (
          <>
            <p>Отсканируйте QR-код в приложении (например, Google Authenticator):</p>
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="qr-code-img" />
            ) : (
              <p>Загрузка QR-кода...</p>
            )}

            <div className="form-block">
              <label>Введите код из приложения</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="6-значный код"
              />
            </div>

            <button className="enable-button" onClick={handleEnable}>
              Подтвердить и включить 2FA
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Enable2FA;
