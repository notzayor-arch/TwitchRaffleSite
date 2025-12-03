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

    if (cachedToken && now < tokenExpires) {
        return cachedToken;
    }

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
    tokenExpires = now + data.expires_in * 1000;

    return cachedToken;
}

/* -------------------------------------------------------
   MINI-CACHE USER
------------------------------------------------------- */

const userCache = new Map();

function cacheUser(login, data) {
    userCache.set(login, {
        data,
        expires: Date.now() + 60 * 1000,
    });
}

function getCachedUser(login) {
    const entry = userCache.get(login);
    if (!entry) return null;
    if (Date.now() > entry.expires) return null;
    return entry.data;
}

/* -------------------------------------------------------
   ROUTE STREAM
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
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const json = await userRes.json();

            // 🔥 SÉCURISATION
            if (!json.data || json.data.length === 0) {
                return res.json({
                    error: "Utilisateur introuvable",
                    live: false
                });
            }

            user = json.data[0];
            cacheUser(name, user);
        }

        /* ----- STREAM INFO ----- */

        const streamRes = await fetch(
            `https://api.twitch.tv/helix/streams?user_id=${user.id}`,
            {
                headers: {
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const streamJSON = await streamRes.json();

        // 🔥 SÉCURISATION
        const live = (streamJSON.data && streamJSON.data.length > 0)
            ? streamJSON.data[0]
            : null;

        /* ----- THUMBNAIL ----- */
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
        console.error("Erreur API Twitch:", err);
        res.status(500).json({ error: "Erreur serveur Twitch" });
    }
});

export default router;
