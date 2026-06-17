// src/components/PhotoGallery.jsx
import React, { useState } from 'react';

export default function PhotoGallery() {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setError('');

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload image files only.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Strip out the extension for a cleaner default title
        const defaultTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

        setPhotos((prevPhotos) => [
          ...prevPhotos,
          {
            id: crypto.randomUUID(),
            url: reader.result,
            name: defaultTitle,
            location: '', // Initialize empty location
            uploadedAt: new Date().toLocaleDateString(),
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = ''; // Clear selection wrapper
  };

  const handleDeletePhoto = (id) => {
    setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== id));
  };

  // Dynamically update fields like 'name' or 'location'
  const handleMetadataChange = (id, field, value) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) =>
        photo.id === id ? { ...photo, [field]: value } : photo
      )
    );
  };

  return (
    <div className="gallery-wrapper">
      <div className="upload-zone">
        <label htmlFor="photo-upload" className="counter" style={{ cursor: 'pointer', margin: 0 }}>
            Choose Journal Photos
        </label>
        <input
          id="photo-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
        {error && <p className="error-message">{error}</p>}
      </div>

      {photos.length === 0 ? (
        <div className="empty-gallery">
          <p>No photos uploaded yet. Start documenting your journey highlights!</p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <div className="image-container">
                <img src={photo.url} alt={photo.name || 'Journal Photo'} />
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="delete-overlay"
                  aria-label="Delete Image"
                >
                  ✕
                </button>
              </div>
              <div className="card-details">
                <input
                  type="text"
                  className="photo-title-input"
                  value={photo.name}
                  placeholder="Give your photo a title..."
                  onChange={(e) => handleMetadataChange(photo.id, 'name', e.target.value)}
                  aria-label="Photo Title"
                />
                
                <div className="location-wrapper">
                  <span className="location-icon">📍</span>
                  <input
                    type="text"
                    className="photo-location-input"
                    value={photo.location}
                    placeholder="Add location..."
                    onChange={(e) => handleMetadataChange(photo.id, 'location', e.target.value)}
                    aria-label="Photo Location"
                  />
                </div>

                <span className="photo-date">{photo.uploadedAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}