import { useState, useEffect } from 'react';
import { getValidAccessToken } from '../getValidAccessToken';

export function useSearch() {

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState('artist');
  const baseUrl = 'https://api.spotify.com';

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

      if (artistId) { // If artistId not blank then do an albums-for-artist search

        //console.log(`artistId: ${artistId}, listing albums for the artist`);
        endpoint = `/v1/artists/${artistId}/albums`;
        url = `${baseUrl}${endpoint}`;
      } else {

        //console.log("blank artistID, searching all albums");
        endpoint = '/v1/search';
        url = `${baseUrl}${endpoint}?q=album%3A${encodeURIComponent(searchQuery)}&type=album`;
      }
    } else { // 'track' === selectedOption

      if (albumId) {

        //console.log(`albumId: ${albumId} listing tracks for album`);
        endpoint = `/v1/albums/${albumId}`;
        url = `${baseUrl}${endpoint}`;
      } else { // Its a plain track search

        //console.log("blank artistID or albumId, searching all tracks");
        endpoint = '/v1/search';
        url = `${baseUrl}${endpoint}?q=track%3A${encodeURIComponent(searchQuery)}&type=track`;
      }
    }

    const profileResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${await getValidAccessToken()}`
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
          //console.log("artist-album listing results: ", jsonData.items);
        } else { // artistId is blank, did album search
          setResults(jsonData.albums.items || []);
          //console.log("searched plain albums: ", jsonData.albums.items);
        }
      } else { //track
        //if(albumId) {
        //console.log("searched artist's selected album for tracks: ", jsonData.tracks.items);
        //} else { // plain track search
        //console.log("searched plain tracks: ", jsonData.tracks);
        //}
        setResults(jsonData.tracks.items || []);
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
