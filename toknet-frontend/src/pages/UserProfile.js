import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './styles/Profile.css';

const UserProfile = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/user/${id}/`);
        setUserData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load user profile.');
      }
    };

    fetchUser();
  }, [id]);

  const getProfileImageSrc = (path) => {
    if (!path) return '/default-avatar.jpg';
    return path.startsWith('/profile_pics/')
      ? `http://localhost:8000${path}`
      : path;
  };

  if (error) return <p className="error">{error}</p>;
  if (!userData) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-content">
        <div className="avatar-container">
          <img
            src={getProfileImageSrc(userData.profile_picture)}
            alt="Profile"
            className="avatar"
          />
        </div>

        <div className="profile-view">
          <p><strong>First Name:</strong> {userData.first_name || '-'}</p>
          <p><strong>Last Name:</strong> {userData.last_name || '-'}</p>
          <p><strong>Middle Name:</strong> {userData.middle_name || '-'}</p>
          <p><strong>Birth Date:</strong> {userData.date_of_birth || '-'}</p>
          <p><strong>Address:</strong> {userData.address || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
