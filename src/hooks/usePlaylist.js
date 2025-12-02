import { useState } from 'react';
import { getValidAccessToken } from '../getValidAccessToken';

async function ensureLoggedIn() {
  try {

    const token = await getValidAccessToken();
    return token;  // If we get here → token is valid (or was just refreshed)
  } catch (err) {

    console.error('Auth failed:', err);
    alert('Spotify session expired or invalid. Please log in again.');
    return null;
  }
}

export function usePlaylist() {
  const [tracks, setTracks] = useState([]);

  const addTrack = (track) => {
    setTracks(prev => prev.some(t => t.id === track.id) ? prev : [...prev, track]);
  };
  const removeTrack = (trackId) => setTracks(prev => prev.filter(t => t.id !== trackId));
  const clearTracks = () => setTracks([]);

  const synchPlaylist = async (playlistName) => {

    const token = await ensureLoggedIn();
    if (!token) {
      alert('Not logged in to Spotify!');
      return false;
    }
    if (tracks.length === 0) {
      alert('Your Tracklist is empty!');
      return false;
    }

    try {
      // Step 1: Get current user's ID
      const userRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${await getValidAccessToken()}` }
      });
      if (!userRes.ok) {
        throw new Error('Failed to get user from /v1/me');
      }
      const { id: userId } = await userRes.json();
      
      // Step 2: Create a new playlist
      const createRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getValidAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: playlistName,
          description: 'Created with Jammming: https://jschmid.xyz/jammming/',
          public: false
        })
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error?.message || 'Failed to create playlist');
      }
      const { id: playlistId } = await createRes.json();
      console.log("New playlist id: ", playlistId);

      // Step 3: Add tracks (Spotify accepts up to 100 URIs at a time)
      const uris = tracks.map(t => t.uri);
      const addRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getValidAccessToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris })
      });

      if (!addRes.ok) {
        const err = await addRes.json();
        throw new Error(err.error?.message || 'Failed to add tracks');
      }

      alert(`Success! Playlist "${playlistName}" created with ${tracks.length} tracks 🎉`);
      return true;
    }  catch(error) {
      console.error("Failed to create playlist: ", error.message);
    }
  };

  return { tracks, addTrack, removeTrack, clearTracks, synchPlaylist };
}
