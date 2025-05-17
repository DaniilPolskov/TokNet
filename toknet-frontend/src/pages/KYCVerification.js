import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './styles/Profile.css';
import axios from 'axios';

const KYCVerification = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    frontIdDocument: null,
    backIdDocument: null,
    selfie: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          throw new Error('Please login to access this page');
        }

        const profileResponse = await axios.get('http://localhost:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!profileResponse.data) {
          throw new Error('No profile data received');
        }

        setUser(profileResponse.data);
        setFormData((prev) => ({ ...prev, email: profileResponse.data.email }));

      } catch (err) {
        setError(err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : e.target.value,
    }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const uploadToCloudinary = async (file) => {
    const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dgnnjctsa/upload';
    const uploadPreset = 'kyc_uploads';

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', uploadPreset);

    try {
      const response = await axios.post(cloudinaryUrl, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.secure_url;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const frontUrl = formData.frontIdDocument ? await uploadToCloudinary(formData.frontIdDocument) : null;
      const backUrl = formData.backIdDocument ? await uploadToCloudinary(formData.backIdDocument) : null;
      const selfieUrl = formData.selfie ? await uploadToCloudinary(formData.selfie) : null;

      const kycPayload = {
        email: formData.email,
        id_document_front_url: frontUrl,
        id_document_back_url: backUrl,
        selfie_url: selfieUrl,
      };

      const token = localStorage.getItem('access_token');

      await axios.post('http://localhost:8000/api/profile/kyc/submit', kycPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      navigate('/profile');
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error submitting KYC. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h3>Profile Error</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()}>Retry</button>
            <button onClick={() => navigate('/login')}>Login</button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-empty">
          <p>No profile data available</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="kyc-container">
      <h2>KYC Verification - Step {step} of 3</h2>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="kyc-step">
            <label>Upload front side of your ID card / first page of your passport:</label>
            <input
              type="file"
              name="frontIdDocument"
              accept="image/*,application/pdf"
              onChange={handleChange}
            />
          </div>
        )}

        {step === 2 && (
          <div className="kyc-step">
            <label>Upload back side of your ID card (if applicable):</label>
            <input
              type="file"
              name="backIdDocument"
              accept="image/*,application/pdf"
              onChange={handleChange}
            />
            <small>If you have a passport, just click "Next".</small>
          </div>
        )}

        {step === 3 && (
          <div className="kyc-step">
            <label>Selfie with your ID card / passport:</label>
            <input
              type="file"
              name="selfie"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
        )}

        {step < 3 && (
          <button
            type="button"
            onClick={handleNext}
            className="kyc-navigate-button"
            disabled={submitting}
          >
            Next
          </button>
        )}

        {step === 3 && (
          <button
            type="submit"
            className="kyc-navigate-button"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </form>

      {showToast && (
        <div className="success-toast">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
          <div className="success-message">KYC submitted successfully!</div>
        </div>
      )}
    </div>
  );
};

export default KYCVerification;