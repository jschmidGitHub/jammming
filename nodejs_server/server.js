// server.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';   // npm i node-fetch@2
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// ---------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------
app.use(cors());                                   // allow SPA
app.use(express.json());                           // parse JSON bodies

// ---------------------------------------------------------------------
// POST /api/exchange
// Body: { code: string, code_verifier: string }
// ---------------------------------------------------------------------
app.post('/api/exchange', async (req, res) => {
    const { code, code_verifier } = req.body;

    if (!code) {
        console.log("Code missing in req body.");
    }
    //console.log("code: ", code);
    if (!code_verifier) {
        console.log("Code_verifier missing in req body.");
    }
    //console.log("code_verifier: ", code_verifier);

    // Basic validation
    if (!code || !code_verifier) {
        return res
            .status(400)
            .json({ error: 'Missing required fields: code and/or code_verifier' });
    }

    // Spotify token request
    const tokenUrl = 'https://accounts.spotify.com/api/token';

    const payload = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI,   // must match exactly what was sent
        client_id: process.env.SPOTIFY_CLIENT_ID,
        code_verifier,
    });

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: payload,
        });

        const data = await response.json();

        if (!response.ok) {
            // Spotify returned an error object
            console.error("Error from Spotify.");
            return res.status(response.status).json({
                error: data.error || 'unknown_error',
                error_description: data.error_description,
            });
        }

        // Success – forward the tokens to the front-end
        res.json({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            token_type: data.token_type,
            scope: data.scope,
        });

    } catch (err) {
        console.error('Token exchange failed:', err);
        res.status(500).json({ error: 'internal_server_error' });
    }
});

async function refreshAccessToken(refreshToken, res) {

    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + btoa(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET),
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        console.error('Failed to refresh the token');
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    const spotifyAccessToken = data.access_token;
    let spotifyRefreshToken = null;
    // Note: refresh_token is usually reused unless a new one is returned
    if (data.refresh_token) {
        spotifyRefreshToken = data.refresh_token;
    }
    const spotifyExpiresAt = Date.now() + (data.expires_in * 1000);

    //console.log("Got data: {access-token, refresh-token, expires-at}: ", spotifyAccessToken, spotifyRefreshToken, spotifyExpiresAt);

    // Success – forward the tokens to the front-end
    res.json({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
    });
}

app.post('/api/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    console.log("Got refresh call: ", refreshToken);
    refreshAccessToken(refreshToken, res);
});

// ---------------------------------------------------------------------
// 404 for everything else
// ---------------------------------------------------------------------
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// ---------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Backend listening at localhost:${PORT} for POSTs`);
});