import { useState } from 'react';

export function useSearch() {

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState('artist');
  const baseUrl = 'https://api.spotify.com';
  const accessToken = localStorage.getItem('spotify_access_token');

  const getSearchResults = async (searchQuery, page, selectedOption, artistId) => {

    let endpoint = '/v1/search';
    let url = '';
    if ('artist' === selectedOption) {
      url = `${baseUrl}${endpoint}?q=artist%3A${encodeURIComponent(searchQuery)}&type=artist`;
    } else if('album' === selectedOption) {
      // If artistId not blank then do an artist-album search
      if(artistId) {
        console.log(`artistId: ${artistId}, listing albums`);
        endpoint = `/v1/artists/${artistId}/albums`;
        url = `${baseUrl}${endpoint}`;
      } else {
        console.log("blank artistID, searching all albums");
        url = `${baseUrl}${endpoint}?q=album%3A${encodeURIComponent(searchQuery)}&type=album`;
      }
    } 
    else {
      url = `${baseUrl}${endpoint}?q=${encodeURIComponent(searchQuery)}`;
    }

    const profileResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) throw new Error('Network error while querying');
    return profileResponse;
  };

  const search = async (searchQuery, pageNum, selectedOption, artistId, append = false) => {

    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      setTotalPages(1);
      setPage(1);
      return;
    }

    setLoading(true);
    try {
      const response = await getSearchResults(searchQuery, pageNum, selectedOption, artistId);
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
      } else if('album' === selectedOption) {
        setResults(jsonData.items || []);
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
