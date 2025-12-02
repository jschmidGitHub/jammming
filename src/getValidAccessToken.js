async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) throw new Error('No refresh token, cant call the back-end');

    const response = await fetch('/api/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            refreshToken: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    // Set localStorage with fields
    localStorage.setItem('spotify_access_token', data.access_token);
    // Note: refresh_token is usually reused unless a new one is returned
    if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }
    localStorage.setItem('spotify_expires_at', Date.now() + data.expires_in * 1000);

    return data.access_token;
}

export async function getValidAccessToken() {
    const expiresAt = localStorage.getItem('spotify_expires_at');
    const accessToken = localStorage.getItem('spotify_access_token');

    // Refresh if expired or within 60 seconds of expiry
    if (!expiresAt || !accessToken || Date.now() > expiresAt - 60_000) {
        return await refreshAccessToken();
    }

    return accessToken;
}