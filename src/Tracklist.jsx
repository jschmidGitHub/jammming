export function Tracklist(props) {

    const tracksDisplay = props.tracks.map(track => (
        <>
           <p>{track.name}</p>
        </>
    ));

    return (
        <>
            <h1>Tracklist</h1>
            {tracksDisplay}
        </>
    );
}

export default Tracklist