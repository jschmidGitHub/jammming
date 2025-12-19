import SearchBar from './SearchBar.jsx';
import Tracklist from './Tracklist.jsx';
import { useState, useEffect } from 'react';
import { useSearch } from './hooks/useSearch.js';
import { usePlaylist } from './hooks/usePlaylist.js';
import getPermissions from './getPermissions.js';
import exchangeCodeForToken from './exchangeCodeForToken.js';
import spotifyLogo from './assets/Spotify_Full_Logo.png';
import noPic from './assets/noPic.png';
import './App.css';

function App() {

  const { results, loading, query, setQuery, search, hasMore, totalPages, selectedOption, setSelectedOption } = useSearch();
  const { tracks, addTrack, removeTrack, clearTracks, synchPlaylist } = usePlaylist();
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

  // Auto-search when switching to 'album' search and artistId is stored
  useEffect(() => {
    if (artistId && selectedOption === 'album') {
      //console.log("Auto-searching albums for artist:", artistId);
      search('', 1, 'album', artistId, albumId);
    }
  }, [artistId, selectedOption]); // Only trigger when artistId or selectedOption changes

  // Auto-search when switching to 'track' search and albumId is stored
  useEffect(() => {
    if (albumId && selectedOption === 'track') {
      //console.log("Auto-searching tracks for album:", albumId);
      search('', 1, 'track', artistId, albumId);
    }
  }, [albumId, selectedOption]); // Only trigger when albumId or selectedOption changes

  const getMediumImage = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return noPic;
    }
    // Try index 1 (medium), fallback to index 0 (large), then small
    return images[1]?.url || images[0]?.url || images[2]?.url || { noPic };
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

  function handleClearArtist() {
    setArtistId('');
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('selected-card');
    });
  }

  function handleClearAlbum() {
    setAlbumId('');
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('selected-card');
    });
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
                e.target.src = { noPic }; // fallback image
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
                e.target.src = { noPic }; // fallback image
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
          <p>
            Artist: {item.artists && item.artists.length > 0
              ? item.artists[0].name
              : 'Unknown Artist'}
          </p>
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
        <div className="logo-and-button">
          <img
            src={spotifyLogo}
            alt="Spotify"
            height="50px"
          />

          <div id="permissionsButtonDiv">
            <button onClick={handleGetPermissions}>Log in:</button>
          </div>
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
      <div id="specified">
        <p>{artistId ? 'Artist selected, \'Album\' will list artists albums' : ''}</p>
        <button onClick={handleClearArtist} hidden={!artistId}>clear</button>

        <p>{albumId ? 'Album selected, \'Track\' will list album-tracks' : ''}</p>
        <button onClick={handleClearAlbum} hidden={!albumId}>clear</button>
      </div>

      <div id="app-mainspace">
        <Tracklist tracks={tracks} addTrack={addTrack} removeTrack={removeTrack} clearTracks={clearTracks} synchPlaylist={synchPlaylist} />
        <ul>
          {cardList}
        </ul>
      </div>
    </div>
  );
}

export default App
