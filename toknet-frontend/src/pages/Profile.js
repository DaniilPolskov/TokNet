import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    date_of_birth: '',
    address: '',
    profile_picture: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        console.warn('No access token, skipping profile fetch');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/api/profile/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Unauthorized. Please login again.');
          localStorage.removeItem('access_token');
          window.location.href = '/login'; // редирект на логин если 401
        } else {
          setError('Failed to fetch user data');
        }
      }
    };

    fetchUserData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    setUserData((prevData) => ({
      ...prevData,
      profile_picture: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('No access token. Please login.');
      return;
    }

    const formData = new FormData();
    for (const key in userData) {
      if (userData[key]) {
        formData.append(key, userData[key]);
      }
    }

    try {
      const response = await axios.put('http://localhost:8000/api/profile/update/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setSuccess('Profile updated successfully');
        setError('');
      }
    } catch (err) {
      setError('Failed to update profile');
      setSuccess('');
    }
  };

  const getProfileImageSrc = () => {
    if (userData.profile_picture) {
      if (typeof userData.profile_picture === 'string') {
        return userData.profile_picture.startsWith('/profile_pics/')
          ? userData.profile_picture
          : `http://localhost:8000${userData.profile_picture}`;
      }
      // Если это файл из формы
      return URL.createObjectURL(userData.profile_picture);
    }
    return '/default-avatar.jpg'; // всегда корректный путь к дефолтной аватарке
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="profile-content">
        <div className="avatar-container">
          <img
            src={getProfileImageSrc()}
            alt="Profile"
            className="avatar"
          />
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div>
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={userData.first_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={userData.last_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Middle Name</label>
            <input
              type="text"
              name="middle_name"
              value={userData.middle_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Birth Date</label>
            <input
              type="date"
              name="date_of_birth"
              value={userData.date_of_birth}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={userData.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Profile Photo</label>
            <input
              type="file"
              name="profile_picture"
              onChange={handlePhotoChange}
              accept="image/*"
            />
          </div>

          <button type="submit">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;