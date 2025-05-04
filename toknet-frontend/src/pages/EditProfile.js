import React, { useState } from "react";
import './styles/EditProfile.css';

const EditProfile = () => {
  const [username, setUsername] = useState("TokNetLover");
  const [location, setLocation] = useState("New York, USA");
  const [online, setOnline] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [showLocation, setShowLocation] = useState(true);
  const [birthdate, setBirthdate] = useState("");
  const [showDayMonth, setShowDayMonth] = useState(true);
  const [showYear, setShowYear] = useState(true);

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = () => {
    alert("Changes saved!");
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <div className="edit-avatar-section">
          <div className="avatar-preview">
            {avatar ? (
              <img src={avatar} alt="avatar" className="avatar-img" />
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

          <div className="form-block">
            <label>Date of Birth</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </div>

          <div className="form-block checkbox-block">
            <label>
              <input
                type="checkbox"
                checked={showDayMonth}
                onChange={() => setShowDayMonth(!showDayMonth)}
              /> Show Day & Month
            </label>
          </div>

          <div className="form-block checkbox-block">
            <label>
              <input
                type="checkbox"
                checked={showYear}
                onChange={() => setShowYear(!showYear)}
              /> Show Year
            </label>
          </div>

          <div className="form-block checkbox-block">
            <button className="kyc-button">Complete KYC</button>
          </div>

          <button className="save-button" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;