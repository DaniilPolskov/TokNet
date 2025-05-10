import React, { useState } from 'react';
import './styles/TechnicalSupport.css';

const TechnicalSupport = () => {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [showToast, setShowToast] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(Array.from(selectedFiles));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Reason:', reason);
    console.log('Message:', message);
    console.log('Files:', files);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="support-wrapper">
      <form className="support-box" onSubmit={handleSubmit}>
        <h2 className="support-title">Обратиться в поддержку</h2>

        <label className="support-label">Причина обращения</label>
        <select
          className="support-select"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        >
          <option value="">Выберите причину</option>
          <option value="payment">Проблема с оплатой</option>
          <option value="funds">Не получил средства</option>
          <option value="error">Ошибка на сайте</option>
          <option value="other">Другое</option>
        </select>

        <label className="support-label">Сообщение</label>
        <textarea
          className="support-text"
          rows="6"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Опишите вашу проблему..."
          required
        />

        <div className="file-upload-wrapper">
          <label htmlFor="file-upload" className="custom-upload">
            Прикрепить скриншот
          </label>
          <input
            className="support-upload"
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            hidden
          />
        </div>

        <div className="file-preview">
          {files.map((file, index) => (
            <div key={index} className="file-preview-item">
              <img
                src={URL.createObjectURL(file)}
                alt={`preview-${index}`}
                className="file-preview-image"
              />
              <button
                type="button"
                className="file-remove-btn"
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        <button type="submit" className="submit-support-btn">
          Отправить
        </button>
      </form>

      {showToast && (
        <div className="success-toast">
          <span className="success-message">Запрос отправлен успешно!</span>
        </div>
      )}
    </div>
  );
};

export default TechnicalSupport;
