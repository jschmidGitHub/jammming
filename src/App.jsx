import SearchBar from './SearchBar.jsx';
import { useEffect } from 'react';
import { useSearch } from './hooks/useSearch.js';
import getPermissions from './getPermissions.js';
import exchangeCodeForToken from './exchangeCodeForToken.js';
import './App.css';

function App() {
  const { results, loading, query, setQuery, search, hasMore, totalPages } = useSearch([], false, "");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      exchangeCodeForToken(code);
    }
  }, []);

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
      </div>
      
      <div id="permissionsButtonDiv">
        <button onClick={getPermissions}>Log in with Spotify</button>
      </div>

      <SearchBar
        query={query}
        setQuery={setQuery}
        search={search}
        loading={loading}
      />
      {loading && <p>Loading...</p>}
    </div>
  );
}

export default App
