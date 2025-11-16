import { useState } from 'react';

function SearchBar(props) {

  const handleOptionChange = (event) => {
    props.setSelectedOption(event.target.value);
  };

  return (
    <>
      <form id="searchForm" onSubmit={(e) => {

        e.preventDefault();
        props.search(props.query, 1, props.selectedOption, props.artistId);
      }}>

        <input value={props.query} onChange={(e) => props.setQuery(e.target.value)} placeholder="Keywords..." size="30" />

        <button type="submit" disabled={props.loading}>
          {props.loading ? 'Searching...' : 'Search'}
        </button>

        <div>
          <input
            type="radio"
            id="all"
            name="choice"
            value="all"
            checked={props.selectedOption === 'all'}
            onChange={handleOptionChange}
          />
          <label htmlFor="all">All</label>
        </div>

        <div>
          <input
            type="radio"
            id="artist"
            name="choice"
            value="artist"
            checked={props.selectedOption === 'artist'}
            onChange={handleOptionChange}
          />
          <label htmlFor="artist">Artist</label>
        </div>

        <div>
          <input
            type="radio"
            id="album"
            name="choice"
            value="album"
            checked={props.selectedOption === 'album'}
            onChange={handleOptionChange}
          />
          <label htmlFor="album">Album</label>
        </div>
      </form>
    </>
  );
}

export default SearchBar