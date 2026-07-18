import { useState } from "react";
import { X } from "lucide-react";

export default function PhotoGallery({ photos, setPhotos, Icon, iconSrc }) {
  const [error, setError] = useState("");

  function handleLabelKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.getElementById("photo-upload")?.click();
    }
  }

  function handlePhotoUpload(event) {
    const files = Array.from(event.target.files);
    setError("");

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload image files only.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const defaultTitle = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        setPhotos((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            url: reader.result,
            name: defaultTitle
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  }

  function removePhoto(id) {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  }

  return (
    <div className="upload-zone">
      <label
        htmlFor="photo-upload"
        className="photo-box"
        tabIndex={0}
        role="button"
        aria-label="Upload travel photos"
        aria-describedby={error ? "photo-upload-error" : undefined}
        onKeyDown={handleLabelKeyDown}
      >
        {iconSrc && <img src={iconSrc} alt="" aria-hidden="true" className="photo-upload-icon" />}
        {Icon && <Icon />}
        <h3>Add Photos</h3>
        <p>Upload your photos</p>
      </label>
      <input id="photo-upload" type="file" multiple accept="image/*" onChange={handlePhotoUpload} hidden aria-label="Upload travel photos" />
      {error && <p id="photo-upload-error" className="error-message" role="alert">{error}</p>}

      {photos.length > 0 && (
        <div className="selected-photos">
          {photos.map((photo) => (
            <div key={photo.id} className="selected-photo">
              <img src={photo.url} alt={photo.name ? `${photo.name} preview` : "Selected travel memory preview"} />
              <button type="button" onClick={() => removePhoto(photo.id)} aria-label="Remove photo">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
