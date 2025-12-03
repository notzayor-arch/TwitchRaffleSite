import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";

dotenv.config();

// Fix ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Render impose son propre port
const PORT = process.env.PORT || 3000;

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
app.use("/", authRoutes);
app.use("/api", apiRoutes);
app.use("/api", streamRoutes);

/* -------------------------------------------------------
   LOGOUT
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
    console.log(`🚀 Serveur lancé sur port ${PORT}`);
});
