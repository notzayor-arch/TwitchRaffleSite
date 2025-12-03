import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/* -------------------------------------------------------
   CONFIG
------------------------------------------------------- */
const callbackURL = process.env.TWITCH_REDIRECT_URI; // 🔥 Centralisé

/* -------------------------------------------------------
   LOGIN TWITCH
------------------------------------------------------- */
router.get("/auth/twitch", (req, res) => {

    // Sauvegarde la page où l’utilisateur était
    req.session.returnTo = req.headers.referer || "/pages/queue.html";

    const params = new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID,
        redirect_uri: callbackURL,        // <─ Utilisation centralisée
        response_type: "code",
        scope: "user:read:email"
    });

    res.redirect(`https://id.twitch.tv/oauth2/authorize?${params}`);
});

/* -------------------------------------------------------
   CALLBACK TWITCH
------------------------------------------------------- */
router.get("/auth/twitch/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send("Erreur : aucun code reçu.");

    try {
        // 1 — Récupérer un token utilisateur
        const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                code,
                grant_type: "authorization_code",
                redirect_uri: callbackURL // <─ Utilisation centralisée
            })
        });

        const token = await tokenRes.json();
        if (!token.access_token) return res.send("Erreur : token invalide.");

        // 2 — Récupérer les infos Twitch
        const userRes = await fetch("https://api.twitch.tv/helix/users", {
            headers: {
                Authorization: `Bearer ${token.access_token}`,
                "Client-ID": process.env.TWITCH_CLIENT_ID
            }
        });

        const data = await userRes.json();
        const u = data.data[0];

        // 3 — Enregistrer la session
        req.session.user = {
            id: u.id,
            login: u.login,
            name: u.display_name,
            avatar: u.profile_image_url,
            email: u.email
        };

        // 4 — Retour à la page précédente
        const redirectTo = req.session.returnTo || "/pages/queue.html";
        delete req.session.returnTo;

        return res.redirect(redirectTo);

    } catch (err) {
        console.error("Erreur callback Twitch :", err);
        res.send("Erreur interne callback.");
    }
});

/* -------------------------------------------------------
   LOGOUT
------------------------------------------------------- */
router.get("/logout", (req, res) => {
    const returnTo = req.headers.referer || "/pages/queue.html";

    req.session.destroy(() => {
        res.redirect(returnTo);
    });
});

export default router;
