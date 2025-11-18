export function Tracklist(props) {

    const tracksDisplay = props.tracks.map(track => (
        <>
            <li key={`${track.id}`}>{track.name}</li>
        </>
    ));

    return (
        <>
            <ul>
                <h1>Tracklist</h1>
                {tracksDisplay}
            </ul>
        </>
    );
}

export default Tracklist