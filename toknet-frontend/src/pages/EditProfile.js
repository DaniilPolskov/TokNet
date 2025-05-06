import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './styles/EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("TokNetLover");
  const [location, setLocation] = useState("New York, USA");
  const [avatar, setAvatar] = useState(null);
  const [showLocation, setShowLocation] = useState(true);

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You must be logged in.");
        return;
      }

      const formData = new FormData();
      formData.append("username", username);
      formData.append("address", location);
      formData.append("show_location", showLocation);
      
      if (avatar instanceof File) {
        formData.append("profile_picture", avatar);
      }

      await axios.put("http://localhost:8000/api/profile/update/", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Changes saved!");
      navigate("/profile");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save profile.");
    }
  };

  const handleKYC = () => {
    navigate("/profile/edit/KYCVerification");
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <div className="edit-avatar-section">
          <div className="avatar-preview">
            {avatar ? (
              <img src={URL.createObjectURL(avatar)} alt="avatar" className="avatar-img" />
            ) : (
              <span className="avatar-placeholder">?</span>
            )}
          </div>
          <input type="file" onChange={handleAvatarChange} className="file-input" />
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

          {showLocation && (
            <div className="form-block">
              <label>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}

          <div className="form-block checkbox-block">
            <label>
              <input
                type="checkbox"
                checked={showLocation}
                onChange={() => setShowLocation(!showLocation)}
              /> Hide Location
            </label>
          </div>

          <div className="form-block checkbox-block">
            <button className="kyc-button" onClick={handleKYC}>Complete KYC</button>
          </div>

          <button className="save-button" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;