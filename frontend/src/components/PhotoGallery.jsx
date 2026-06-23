import React, { useState } from 'react';

export default function PhotoGallery({ photos, setPhotos, Icon, onlyUploadBox }) {
  const [error, setError] = useState('');
  
  // Search and Filter States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // State to track which photo is currently enlarged
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);

  // Handle file uploads and convert them to data URLs for display
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
            const defaultTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const today = new Date().toISOString().split('T')[0];

            setPhotos((prevPhotos) => [
            ...prevPhotos,
            {
                id: crypto.randomUUID(),
                url: reader.result,
                name: defaultTitle,
                location: '', 
                uploadedAt: today,
            },
            ]);
        };
        reader.readAsDataURL(file);
    });

    e.target.value = ''; 
  };

  // photo deletion
  const handleDeletePhoto = (id, e) => {
    e.stopPropagation();
    setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== id));
    if (activeLightboxPhoto?.id === id) {
        setActiveLightboxPhoto(null);
    }
  };

  // changes to photo metadata (title, location, date)
  const handleMetadataChange = (id, field, value) => {
    setPhotos((prevPhotos) =>
        prevPhotos.map((photo) =>
        photo.id === id ? { ...photo, [field]: value } : photo
        )
    );
  };

  // Filter logic based on user search inputs
  const filteredPhotos = photos.filter((photo) => {
    const matchesKeyword = (photo.name || '').toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesLocation = (photo.location || '').toLowerCase().includes(searchLocation.toLowerCase());
    const matchesDate = searchDate ? photo.uploadedAt === searchDate : true;
    return matchesKeyword && matchesLocation && matchesDate;
  });

  const handleClearFilters = () => {
    setSearchKeyword('');
    setSearchLocation('');
    setSearchDate('');
  };
    
  // The upload box element
  const UploadBoxElement = (
    <div className="upload-zone" style={{ width: '100%' }}>
        <label htmlFor="photo-upload" className="photo-box" style={{ cursor: 'pointer', margin: 0, width: '100%' }}>
            {Icon && <Icon />}
            <h3>Add Photos</h3>
            <p>Upload your photos ({photos.length} selected)</p>
        </label>
        <input
            id="photo-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
        />
        {error && <p className="error-message" style={{ color: '#b45309', marginTop: '8px', fontWeight: 'bold' }}>{error}</p>}
    </div>
  );

  // If onlyUploadBox is true, return just the upload box without the gallery/search filters
  if (onlyUploadBox) {
      return UploadBoxElement;
  }

  return (
      <div className="gallery-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
        {UploadBoxElement}

        {photos.length === 0 ? (
            <div className="empty-gallery">
              <p>No photos uploaded yet. Use the area above to start documenting your journey highlights!</p>
            </div>
        ) : (
            <>
              {/* Dynamic Search & Filter Controls Container */}
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search by keyword/title..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="search-input"
                />
                <input
                  type="text"
                  placeholder="Search by location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="search-input"
                />
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="search-date-input"
                />
                {(searchKeyword || searchLocation || searchDate) && (
                  <button onClick={handleClearFilters} className="clear-search-btn">
                    Clear
                  </button>
                )}
              </div>

              {/* Grid Rendering Conditional on Filter Results */}
              {filteredPhotos.length === 0 ? (
                <div className="no-results">
                  <p>No photos match your search criteria. Try a different keyword, location, or date!</p>
                </div>
              ) : (
                <div className="photo-grid">
                  {filteredPhotos.map((photo) => (
                    <div key={photo.id} className="photo-card">
                      <div 
                          className="image-container" 
                          onClick={() => setActiveLightboxPhoto(photo)}
                          style={{ cursor: 'pointer' }}
                          title="Click to expand"
                      >
                          <img src={photo.url} alt={photo.name || 'Journal Photo'} />
                          <button
                          onClick={(e) => handleDeletePhoto(photo.id, e)}
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

                          <div className="date-wrapper">
                          <input
                              type="date"
                              className="photo-date-input"
                              value={photo.uploadedAt}
                              onChange={(e) => handleMetadataChange(photo.id, 'uploadedAt', e.target.value)}
                              aria-label="Photo Date"
                          />
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
        )}

        {/* Lightbox Overlay */}
        {activeLightboxPhoto && (
            <div className="lightbox-overlay" onClick={() => setActiveLightboxPhoto(null)}>
            <button className="lightbox-close" onClick={() => setActiveLightboxPhoto(null)}>✕</button>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                <img src={activeLightboxPhoto.url} alt={activeLightboxPhoto.name} />
                {activeLightboxPhoto.name && <h3 className="lightbox-caption">{activeLightboxPhoto.name}</h3>}
            </div>
            </div>
        )}
      </div>
  );
}