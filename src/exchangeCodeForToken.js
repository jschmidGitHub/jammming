async function exchangeCodeForToken(code) {

    const codeVerifier = localStorage.getItem('code_verifier');
    localStorage.removeItem('code_verifier');
    const clientId = '91abbeed1fc745b6b9d501bfdf22a243';
    const redirectUri = 'http://127.0.0.1:5175/callback';

    console.log("CodeVerifier: " + codeVerifier);
    //console.log(code);
    const url = "https://accounts.spotify.com/api/token";
    const params = new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params, // Pass URLSearchParams directly
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Token exchange failed:', response.status, error);
            return null;
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        console.log('Access token saved: ', data.access_token);
        return data;
    } catch (err) {
        console.error('Fetch error:', err);
        return null;
    }
}

export default exchangeCodeForToken