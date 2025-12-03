import express from "express";

const router = express.Router();

/* -------------------------------------------------------
   INFOS UTILISATEUR
------------------------------------------------------- */
router.get("/me", (req, res) => {
    if (!req.session.user) {
        return res.json({ loggedIn: false });
    }

    res.json({
        loggedIn: true,
        user: req.session.user
    });
});

/* -------------------------------------------------------
   DECONNEXION (API)
------------------------------------------------------- */
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

/* -------------------------------------------------------
   SECURISATION D'UNE ROUTE
   Exemple : certaines API doivent nécessiter un login
------------------------------------------------------- */
router.get("/require-login", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: "Non connecté",
            loggedIn: false
        });
    }

    res.json({ ok: true });
});

/* -------------------------------------------------------
   MET A JOUR LA PAGE DE RETOUR (OPTIONNEL)
------------------------------------------------------- */
router.post("/set-return", (req, res) => {
    const referer = req.headers.referer;
    req.session.returnTo = referer;
    res.json({ saved: true, returnTo: referer });
});

export default router;
