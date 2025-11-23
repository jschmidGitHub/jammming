async function exchangeCodeForToken(code, state) {

    const codeVerifier = localStorage.getItem('code_verifier');
    const storedState = localStorage.getItem('spotify_auth_state');

    if (state !== storedState) {
        throw new Error('State mismatch - possible CSRF');
    }

    const response = await fetch('https://jschmid.xyz/api/exchange', { // https://jschmid.xyz/api/exchange', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code, // from URL
            code_verifier: codeVerifier  // from PKCE
        })
    });
    if (!response.ok) {
        throw new Error('Network error doing POST to /api/exchange.');
    }

    // Get access_token and other fields from back end...
    const tokenData = await response.json();

    // Store tokens
    localStorage.setItem('spotify_access_token', tokenData.access_token);
    localStorage.setItem('spotify_refresh_token', tokenData.refresh_token || '');
    localStorage.setItem('spotify_expires_at', Date.now() + tokenData.expires_in * 1000);

    // Clean up PKCE & state
    localStorage.removeItem('code_verifier');
    localStorage.removeItem('spotify_auth_state');

    return tokenData;
}

export default exchangeCodeForToken