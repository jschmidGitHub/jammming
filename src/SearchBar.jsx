function SearchBar(props) {

  const handleOptionChange = (event) => {
    props.setSelectedOption(event.target.value);
  };

  return (
    <>
      <form id="searchForm" onSubmit={(e) => {

        e.preventDefault();
        props.search(props.query, 1, props.selectedOption, props.artistId, props.albumId);
      }}>

        <input value={props.query} 
               disabled={props.isSearchFormDisabled} 
               onChange={(e) => props.setQuery(e.target.value)} placeholder="Keywords..." size="30" />

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

        <div>
          <input
            type="radio"
            id="track"
            name="choice"
            value="track"
            checked={props.selectedOption === 'track'}
            onChange={handleOptionChange}
          />
          <label htmlFor="track">Track</label>
        </div>

        <button type="submit" disabled={props.loading}>
          {props.loading ? 'Searching...' : 'Search'}
        </button>

      </form>
    </>
  );
}

export default SearchBar