export function Tracklist(props) {

    const tracksDisplay = props.tracks.map(track => (
        <>
            <li key={`${track.id}`}>{track.name}</li>
        </>
    ));

    return (
        <>
            <h1>Tracklist</h1>
            <ul>
                {tracksDisplay}
            </ul>
        </>
    );
}

export default Tracklist