import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './styles/EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          alert("You are not authorized.");
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:8000/api/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = response.data;
        setUsername(user.username || "");
        setEmail(user.email || "");
        setAvatarUrl(user.profile_picture);
        setIs2FAEnabled(user.is_2fa_enabled);
        setKycSubmitted(user.kyc_submitted);
      } catch (err) {
        console.error("Profile loading error:", err);
        alert("Profile loading error.");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You are not authorized.");
        return;
      }

      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      if (password) {
        formData.append("password", password);
      }
      if (currentPassword) {
        formData.append("current_password", currentPassword);
      }

      await axios.put("http://localhost:8000/api/profile/update/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("The changes have been saved!");
      navigate("/profile");
    } catch (err) {
      console.error("Retention Error:", err);
      alert("Failed to save profile.");
    }
  };

  const handleKYC = () => {
    navigate("/profile/edit/KYCVerification");
  };

  const handle2FA = () => {
    navigate("/profile/edit/enable2FA");
  };

  const handleDisable2FA = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You are not authorized.");
        return;
      }

      await axios.post("http://localhost:8000/api/2fa/disable/", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIs2FAEnabled(false);
      alert("2FA deactivated.");
    } catch (err) {
      console.error("Error when disabling 2FA:", err);
      alert("Failed to disable 2FA.");
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <div className="edit-avatar-section">
          <div className="avatar-preview">
            <img
              src={avatarUrl || "/images/default.svg"}
              alt="avatar"
              className="avatar-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/default.svg";
              }}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-block">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-block">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-block">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter the current password"
            />
          </div>

          <div className="form-block">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank if you are not changing"
            />
          </div>

          <div className="form-block checkbox-block">
            <button 
              className="kyc-button" 
              onClick={handleKYC} 
              disabled={kycSubmitted}
            >
              {kycSubmitted ? "You've already applied" : "Complete KYC"}
            </button>
          </div>

          <div className="form-block checkbox-block">
            {isLoading ? (
              <button className="kyc-button" disabled>Loading...</button>
            ) : is2FAEnabled ? (
              <button className="kyc-button" onClick={handleDisable2FA}>
                Disable 2FA
              </button>
            ) : (
              <button className="kyc-button" onClick={handle2FA}>
                Enable 2FA
              </button>
            )}
          </div>

          <button className="save-button" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;