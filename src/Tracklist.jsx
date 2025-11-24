import { useState } from 'react';
import './Tracklist.css';

function Tracklist({ tracks, removeTrack, clearTracks }) {
    const [contextMenu, setContextMenu] = useState(null); // { x, y } or null

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY
        });
    };

    const handleClear = () => {
        clearTracks();
        setContextMenu(null);
    };

    const handleSynchronize = () => {
        console.log('do synchronize now.');
    }

    const closeMenu = () => setContextMenu(null);

    return (
        <div
            className="tracklist-container"
            onContextMenu={handleContextMenu}
            onClick={closeMenu}               // close menu on any left click
            style={{ position: 'relative' }}  // needed for the absolute menu
        >
            <h1>Tracklist</h1>

            <ul>
                {tracks.length === 0 ? (
                    <li style={{ color: '#888', fontStyle: 'italic' }}>(empty)</li>
                ) : (
                    tracks.map(track => (
                        <li key={track.id} className="track-card">
                            <span>{track.name}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // don't close the menu when clicking button
                                    removeTrack(track.id);
                                }}
                                className="remove-btn"
                            >
                                −
                            </button>
                        </li>
                    ))
                )}
            </ul>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        backgroundColor: '#333',
                        color: 'white',
                        borderRadius: '6px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                        zIndex: 9999,
                        padding: '8px 0',
                        fontSize: '14px',
                    }}
                    onClick={(e) => e.stopPropagation()} // prevent menu from closing when clicking inside it
                >
                    <div
                        onClick={handleClear}
                        style={{
                            padding: '8px 20px',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        Clear Tracklist
                    </div>

                    <div
                        onClick={handleSynchronize}
                        style={{
                            padding: '8px 20px',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        Synchronize Tracklist
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tracklist;