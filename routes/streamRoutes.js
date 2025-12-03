import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/* -------------------------------------------------------
   TOKEN TWITCH (Client Credentials) — CACHÉ 60 MINUTES
------------------------------------------------------- */

let cachedToken = null;
let tokenExpires = 0;

async function getAppToken() {
    const now = Date.now();

    // Si token encore valide → on réutilise
    if (cachedToken && now < tokenExpires) {
        return cachedToken;
    }

    // Sinon → on génère un nouveau token
    const res = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: "client_credentials",
        }),
    });

    const data = await res.json();

    cachedToken = data.access_token;
    tokenExpires = now + data.expires_in * 1000; // expires_in = 3600 sec

    return cachedToken;
}

/* -------------------------------------------------------
   MINI-CACHE USER (pour éviter trop d'appels)
------------------------------------------------------- */

const userCache = new Map(); // key = login, value = { data, expires }

function cacheUser(login, data) {
    userCache.set(login, {
        data,
        expires: Date.now() + 60 * 1000 // 60 sec
    });
}

function getCachedUser(login) {
    const entry = userCache.get(login);
    if (!entry) return null;
    if (Date.now() > entry.expires) return null;
    return entry.data;
}

/* -------------------------------------------------------
   ROUTE STREAM : /api/stream/:name
------------------------------------------------------- */

router.get("/stream/:name", async (req, res) => {
    const name = req.params.name.toLowerCase();

    try {
        const token = await getAppToken();

        /* ----- USER INFO ----- */

        let user = getCachedUser(name);

        if (!user) {
            const userRes = await fetch(
                `https://api.twitch.tv/helix/users?login=${name}`,
                {
                    headers: {
                        "Client-ID": process.env.TWITCH_CLIENT_ID,
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            const json = await userRes.json();
            user = json.data[0];

            if (user) cacheUser(name, user);
        }

        if (!user) {
            return res.json({ error: "Utilisateur introuvable", live: false });
        }

        /* ----- STREAM INFO ----- */

        const streamRes = await fetch(
            `https://api.twitch.tv/helix/streams?user_id=${user.id}`,
            {
                headers: {
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        const streamJSON = await streamRes.json();
        const live = streamJSON.data[0] || null;

        /* ----- THUMBNAIL (1120x630) ----- */

        const thumbnail = live?.thumbnail_url
            ? live.thumbnail_url.replace("{width}", "1120").replace("{height}", "630")
            : null;

        /* ----- REPONSE ----- */

        res.json({
            login: user.login,
            name: user.display_name,
            avatar: user.profile_image_url,
            live: !!live,
            title: live?.title ?? null,
            game: live?.game_name ?? null,
            viewers: live?.viewer_count ?? null,
            started_at: live?.started_at ?? null,
            thumbnail,
        });

    } catch (err) {
        console.error("Erreur API Twitch :", err);
        res.status(500).json({ error: "Erreur serveur Twitch" });
    }
});

export default router;
