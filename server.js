import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import des routes
import authRoutes from "./routes/authRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";

dotenv.config();

// Fix ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

/* -------------------------------------------------------
   SESSIONS
------------------------------------------------------- */
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

/* -------------------------------------------------------
   STATIC FILES
------------------------------------------------------- */
app.use(express.static(path.join(__dirname, "public")));

/* -------------------------------------------------------
   ROUTES
------------------------------------------------------- */

// Auth (login / callback Twitch)
app.use("/", authRoutes);

// API utilisateur (api/me)
app.use("/api", apiRoutes);

// Streams (api/stream/:name)
app.use("/api", streamRoutes);

/* -------------------------------------------------------
   LOGOUT (corrigé)
------------------------------------------------------- */
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        const back = req.headers.referer || "/pages/queue.html";
        res.redirect(back);
    });
});

/* -------------------------------------------------------
   SERVER START
------------------------------------------------------- */
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
