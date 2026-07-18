import { useEffect, useMemo, useRef, useState } from "react";
import { Music, Play } from "lucide-react";
import "../styles/MusicPicker.css";

function MusicPicker({ selectedMusicId, onSelect }) {
  const [tracks, setTracks] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    async function loadManifest() {
      try {
        const response = await fetch("/music-manifest.json");
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setTracks(data);
        }
      } catch (error) {
        console.error("Failed to load music manifest:", error);
      }
    }

    loadManifest();
  }, []);

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }

    function handlePointerDown(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [pickerOpen]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const selectedTrack = useMemo(() => {
    return tracks.find((track) => track.id === selectedMusicId) || null;
  }, [selectedMusicId, tracks]);

  function getDisplayTitle(track) {
    if (!track?.title) {
      return "";
    }

    return track.title;
  }

  async function playTrack(track) {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const sourceUrl = track?.filePath;
    if (!sourceUrl) {
      return;
    }

    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = sourceUrl;
      audioRef.current.load();
      await audioRef.current.play();
    } catch (error) {
      console.error("Unable to play the selected track:", error);
    }
  }

  function handleSelect(track) {
    onSelect(track.id);
    setPickerOpen(false);
    playTrack(track);
  }

  function togglePicker() {
    setPickerOpen((current) => !current);
  }

  return (
    <div className="music-box" role="group" aria-label="Music memory picker">
      <div className="music-icon-wrap">
        <Music className="music-note" />
      </div>
      <div className="music-copy">
        <h2>Music Memory</h2>
        <p>Add a song that reminds you of this trip</p>
        <div className="slider">
          <div></div>
        </div>
        <div className="music-times">
          <span>0:42</span>
          <span>2:18</span>
        </div>
      </div>
      <div className="music-picker-panel" ref={pickerRef}>
        <button
          type="button"
          className={`play-btn ${selectedMusicId ? "active" : ""}`}
          aria-label={selectedTrack ? `Selected ${selectedTrack.title}` : "Choose music memory"}
          aria-expanded={pickerOpen}
          onClick={togglePicker}
        >
          <Play />
        </button>
        <div className={`music-selection-label ${selectedTrack ? "has-selection" : ""}`}>
          {selectedTrack ? getDisplayTitle(selectedTrack) : ""}
        </div>
        {pickerOpen && (
          <div className="music-dropdown">
            {tracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className={`music-dropdown-item ${selectedMusicId === track.id ? "active" : ""}`}
                onClick={() => handleSelect(track)}
              >
                <span>{getDisplayTitle(track)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MusicPicker;
