import { useState } from 'react';
import './Tracklist.css';

function Tracklist({ tracks, removeTrack, clearTracks, synchPlaylist }) {
    const [contextMenu, setContextMenu] = useState(null); // { x, y } or null
    const [renameModal, setRenameModal] = useState(false);
    const [newName, setNewName] = useState('');

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY
        });
    };

    const handleClear = () => {
        clearTracks();
        setContextMenu(null); // close menu
    };

    const handleRename = () => {
        setNewName('My Playlist');
        setRenameModal(true);
        setContextMenu(null); // close menu
    };

    const confirmRename = () => {
        document.getElementById('tracklist-title').innerHTML=`${newName}`;
        setRenameModal(false);
        setNewName('');
    };

    const cancelRename = () => {
        setRenameModal(false);
        setNewName('');
    };

    const handleSynchronize = () => {
        synchPlaylist(document.getElementById('tracklist-title').innerHTML);
        setContextMenu(null); // close menu
    }

    const closeMenu = () => setContextMenu(null);

    return (
        <div
            className="tracklist-container"
            onContextMenu={handleContextMenu}
            onClick={closeMenu}               // close menu on any left click
            style={{ position: 'relative' }}  // needed for the absolute menu
        >
            <h1 id='tracklist-title'>Tracklist</h1>

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
                        onClick={handleRename}
                        style={{
                            padding: '8px 20px',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        Rename Tracklist
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

            {renameModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                }} onClick={cancelRename}>
                    <div style={{
                        background: '#222',
                        padding: '24px',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        color: 'white',
                    }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 16px 0' }}>Spotify Playlist Name:</h3>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter playlist name..."
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '16px',
                                borderRadius: '6px',
                                border: 'none',
                                marginBottom: '16px',
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmRename();
                                if (e.key === 'Escape') cancelRename();
                            }}
                        />
                        <div style={{ textAlign: 'right', gap: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={cancelRename} style={{ background: '#666' }}>
                                Cancel
                            </button>
                            <button onClick={confirmRename} style={{ background: '#1DB954' }}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tracklist;