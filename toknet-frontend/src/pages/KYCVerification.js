import React, { useState } from "react";
import './styles/Profile.css';

const KYCVerification = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    nationality: "",
    idDocument: null,
    selfie: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log("Submitting KYC:", formData);
    alert("KYC submitted successfully!");
  };

  return (
    <div className="kyc-container">
      <h2>KYC Verification - Step {step} of 3</h2>

      {step === 1 && (
        <div className="kyc-step">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
          />
          <input
            type="date"
            name="birthDate"
            placeholder="Date of Birth"
            value={formData.birthDate}
            onChange={handleChange}
          />
          <input
            type="text"
            name="nationality"
            placeholder="Nationality"
            value={formData.nationality}
            onChange={handleChange}
          />
        </div>
      )}

      {step === 2 && (
        <div className="kyc-step">
          <label>Upload Passport / ID:</label>
          <input
            type="file"
            name="idDocument"
            accept="image/*,application/pdf"
            onChange={handleChange}
          />
        </div>
      )}

      {step === 3 && (
        <div className="kyc-step">
          <label>Upload Selfie with ID:</label>
          <input
            type="file"
            name="selfie"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
      )}

      <div className="kyc-buttons">
        {step > 1 && <button onClick={handlePrev}>Back</button>}
        {step < 3 && <button onClick={handleNext}>Next</button>}
        {step === 3 && <button onClick={handleSubmit}>Submit</button>}
      </div>
    </div>
  );
};

export default KYCVerification;