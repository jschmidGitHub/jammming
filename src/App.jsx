import SearchBar from './SearchBar.jsx';
import Tracklist from './Tracklist.jsx';
import { useState, useEffect } from 'react';
import { useSearch } from './hooks/useSearch.js';
import { usePlaylist } from './hooks/usePlaylist.js';
import getPermissions from './getPermissions.js';
import exchangeCodeForToken from './exchangeCodeForToken.js';
import './App.css';

function App() {

  const { results, loading, query, setQuery, search, hasMore, totalPages, selectedOption, setSelectedOption } = useSearch();
  const { tracks, addTrack, removeTrack, clearTracks } = usePlaylist();
  const [loginTriggered, setLoginTriggered] = useState(false);
  const [artistId, setArtistId] = useState('');
  const [albumId, setAlbumId] = useState('');
  let cardList = [];

  // Trigger login redirect
  useEffect(() => {

    if (loginTriggered) {
      setLoginTriggered(false);
      getPermissions();
    }
  }, [loginTriggered]);

  // On any page load, check for ?code=... state=... in URL
  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {

      exchangeCodeForToken(code, state)
        .then(() => {
          window.history.replaceState({}, '', '/');
        })
        .catch(err => {
          console.error("Token exchange failed:", err);
        });
    }
  }, []);

  const getMediumImage = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return '/noPic.png';
    }
    // Try index 1 (medium), fallback to index 0 (large), then small
    return images[1]?.url || images[0]?.url || images[2]?.url || '/noPic.png';
  };

  function handleGetPermissions() {
    setLoginTriggered(true);
  }
  function handleClickArtist(e) {

    // Remove previous selection
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('selected-card');
    });
    setArtistId(e.currentTarget.dataset.artistId);
    e.currentTarget.classList.add('selected-card');
  }
  function handleClickAlbum(e) {

    // Remove previous selection
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('selected-card');
    });
    setAlbumId(e.currentTarget.dataset.albumId);
    e.currentTarget.classList.add('selected-card');
  }
  function handleAddTrack(e) {

    const newTrack = {
      id: e.currentTarget.dataset.trackId,
      name: e.currentTarget.dataset.trackName,
      uri: e.currentTarget.dataset.trackUri,
    };
    addTrack(newTrack);
  }

  if (results.length > 0) {
    if (selectedOption === 'artist') {

      cardList = results.map(item => (
        <li className="card" key={`${selectedOption}-${item.id}`} data-artist-id={item.id} onClick={handleClickArtist}>
          <h2>{item.name}</h2>

          <div className="card-content">
            <img
              className="cardIcon"
              src={getMediumImage(item.images)}
              alt={item.name}
              onError={(e) => {
                e.target.src = '/noPic.png'; // fallback image
                e.target.onerror = null; // prevent infinite loop if noPic.png is also missing
              }}
            />

          </div>
        </li>
      ));
    } else if (selectedOption === 'album') {
      cardList = results.map(item => (
        <div className="card" key={`${selectedOption}-${item.id}`} data-album-id={item.id} onClick={handleClickAlbum}>
          <h2>{item.name}</h2>

          <div className="card-content">
            <img
              className="cardIcon"
              src={getMediumImage(item.images)}
              alt={item.name}
              onError={(e) => {
                e.target.src = '/noPic.png'; // fallback image
                e.target.onerror = null; // prevent infinite loop if noPic.png is also missing
              }}
            />
            <p>{item.total_tracks} tracks</p>

          </div>
        </div>
      ));
    } else { // 'track'
      cardList = results.map(item => (
        <div className="track-card" key={`${selectedOption}-${item.id}`} data-track-id={item.id} >
          <h2>{item.name}</h2>
          <button
            className="addTrackButton"
            data-track-id={item.id}
            data-track-name={item.name}
            data-track-uri={item.uri}

            onClick={handleAddTrack}>
            Add
          </button>
        </div>
      ));
    }
  }

  return (

    <div id="app-container">

      <div id="header-container">
        <h1>Jammming Playlists</h1>
        <h2>Powered by:</h2>
        <div>
          <img
            src="/Spotify_Full_Logo.png"
            alt="Spotify"
            height="50px"
          />
        </div>
        <div id="permissionsButtonDiv">
          <button onClick={handleGetPermissions}>Log in with Spotify</button>
        </div>

        <SearchBar
          query={query}
          setQuery={setQuery}
          search={search}
          loading={loading}
          artistId={artistId}
          albumId={albumId}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
        {loading && <p>Loading...</p>}
      </div>

      <div id="app-mainspace">
        <Tracklist tracks={tracks} addTrack={addTrack} removeTrack={removeTrack} clearTracks={clearTracks} />
        <ul>
          {cardList}
        </ul>
      </div>
    </div>
  );
}

export default App
