// server.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';   // npm i node-fetch@2   (or use native fetch in Node ≥18)
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5176;

// ---------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------
app.use(cors());                                   // allow your SPA (e.g. localhost:5173)
app.use(express.json());                           // parse JSON bodies

// ---------------------------------------------------------------------
// POST /api/exchange
// Body: { code: string, code_verifier: string }
// ---------------------------------------------------------------------
app.post('/api/exchange', async (req, res) => {
    const { code, code_verifier } = req.body;

    // ---- basic validation ------------------------------------------------
    if (!code || !code_verifier) {
        return res
            .status(400)
            .json({ error: 'Missing required fields: code and/or code_verifier' });
    }

    // ---- Spotify token request -------------------------------------------
    const tokenUrl = 'https://accounts.spotify.com/api/token';

    const payload = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI,   // must match exactly what you sent
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
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
    console.log(`Backend listening at http://localhost:${PORT} POST /api/exchange`);
});