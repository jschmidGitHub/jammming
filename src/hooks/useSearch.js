import { useState, useEffect } from 'react';

export function useSearch() {

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState('artist');
  const baseUrl = 'https://api.spotify.com';
  const accessToken = localStorage.getItem('spotify_access_token');

  useEffect(() => {
    setResults([]);
  }, [selectedOption]);

  const getSearchResults = async (searchQuery, page, selectedOption, artistId, albumId) => {

    let endpoint = '';
    let url = '';
    if ('artist' === selectedOption) {

      endpoint = '/v1/search';
      url = `${baseUrl}${endpoint}?q=artist%3A${encodeURIComponent(searchQuery)}&type=artist`;
    } else if ('album' === selectedOption) {

      // If artistId not blank then do an artist-album search
      if (artistId) {

        console.log(`artistId: ${artistId}, listing albums for the artist`);
        endpoint = `/v1/artists/${artistId}/albums`;
        url = `${baseUrl}${endpoint}`;
      } else {

        console.log("blank artistID, searching all albums");
        endpoint = '/v1/search';
        url = `${baseUrl}${endpoint}?q=album%3A${encodeURIComponent(searchQuery)}&type=album`;
        console.log(url);
      }
    } else { // album-tracks

      console.log(`artistId: ${artistId}, albumId: ${albumId} listing tracks for album`);
      endpoint = `/v1/albums/${albumId}`;
      url = `${baseUrl}${endpoint}`;
    }


    const profileResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) throw new Error('Network error while querying');
    return profileResponse;
  };

  const search = async (searchQuery, pageNum, selectedOption, artistId, albumId, append = false) => {

    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      setTotalPages(1);
      setPage(1);
      return;
    }

    setLoading(true);
    try {
      const response = await getSearchResults(searchQuery, pageNum, selectedOption, artistId, albumId);
      const jsonData = await response.json();

      //const newTotalPages = jsonData.total_pages || 1;
      //setTotalPages(newTotalPages);
      //setPage(pageNum);

      //if (append) {
      //  setResults(prev => [...prev, ...jsonData]);
      //} else {
      //  setResults(jsonData || []);
      //}

      if ('artist' === selectedOption) {
        setResults(jsonData.artists.items || []);
      } else if ('album' === selectedOption) {
        if (artistId) {
          setResults(jsonData.items || []);
          console.log("artist-album listing results: ", jsonData.items);
        } else { // artistId is blank, did album search
          setResults(jsonData.albums.items || []);
          console.log("searched plain albums: ", jsonData.albums.items);
        }
      } else { //track
        console.log("searched artist's selected album for tracks: ", jsonData.tracks.items);
        setResults(jsonData.tracks.items);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const hasMore = page < totalPages;
  return { query, setQuery, results, loading, search, hasMore, totalPages, selectedOption, setSelectedOption };
}
