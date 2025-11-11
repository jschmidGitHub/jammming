import { useState } from 'react';

export async function useSearch() {

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const baseUrl = 'https://api.spotify.com';

  const getSearchResults = async (searchQuery, page) => {

    let endpoint = '/v1/me';
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + 'access_token'
      }
    });

    if (!response.ok) throw new Error('Network error');
    return response;
  };

  const search = async (searchQuery, pageNum, append = false) => {

    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      setTotalPages(1);
      setPage(1);
      return;
    }

    setLoading(true);
    try {
      const response = await getSearchResults(searchQuery, pageNum);
      const jsonData = await response.json();

      const newTotalPages = jsonData.total_pages || 1;
      setTotalPages(newTotalPages);
      setPage(pageNum);

      if (append) {
        setResults(prev => [...prev, ...jsonData.results]);
      } else {
        setResults(jsonData.results || []);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const hasMore = page < totalPages;
  return { query, setQuery, results, loading, search, hasMore, totalPages };
}
