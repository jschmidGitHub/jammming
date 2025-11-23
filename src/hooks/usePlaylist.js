import { useState } from 'react';

export function usePlaylist() {
  const [tracks, setTracks] = useState([]);

  const addTrack = (track) => {
    setTracks(prev => prev.some(t => t.id === track.id) ? prev : [...prev, track]);
  };
  const removeTrack = (trackId) => setTracks(prev => prev.filter(t => t.id !== trackId));
  const clearTracks = () => setTracks([]);

  return { tracks, addTrack, removeTrack, clearTracks };
}