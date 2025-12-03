/* ---------------------------------------------------
   CONFIG
--------------------------------------------------- */

let queue = ["gotaga"];          // File d’attente (test)
let currentStreamer = "gotaga";  // Streamer affiché

const queueAvatars = document.getElementById("queueAvatars");
const addToQueueBtn = document.getElementById("addToQueueBtn");
const addBtnBottom = document.getElementById("addBtnBottom");

const twitchFrame = document.getElementById("twitchPlayer");
const streamInfo = document.getElementById("streamInfo");

const TWITCH_PARENT = "localhost"; // IMPORTANT pour Twitch Player


/* ---------------------------------------------------
   CHARGER UN STREAMER DANS LE PLAYER
--------------------------------------------------- */
async function loadStreamer(name) {
    currentStreamer = name;

    // Charger infos stream depuis l’API backend
    const res = await fetch(`/api/stream/${name}`);
    const data = await res.json();

    // Mettre le player Twitch
    twitchFrame.src = `https://player.twitch.tv/?channel=${name}&parent=${TWITCH_PARENT}&muted=false`;

    // Afficher les infos live
    streamInfo.innerHTML = `
        <h2>${data.title || "Titre indisponible"}</h2>
        <p><strong>Jeu :</strong> ${data.game || "Non spécifié"}</p>
        <p><strong>Spectateurs :</strong> ${data.viewers || 0}</p>
    `;
}


/* ---------------------------------------------------
   METTRE À JOUR LA COLONNE GAUCHE (AVATARS)
--------------------------------------------------- */
async function refreshQueue() {
    queueAvatars.innerHTML = ""; // Reset

    for (let name of queue) {

        // Récupérer infos Twitch
        const res = await fetch(`/api/stream/${name}`);
        const data = await res.json();

        // Créer un bloc avatar
        const avatarBox = document.createElement("div");
        avatarBox.className = "queue-avatar-item";

        const avatar = document.createElement("img");
        avatar.src = data.avatar;
        avatar.alt = data.name;

        avatarBox.appendChild(avatar);

        // Clic → afficher ce streamer
        avatarBox.addEventListener("click", () => loadStreamer(name));

        queueAvatars.appendChild(avatarBox);
    }
}


/* ---------------------------------------------------
   AJOUTER UTILISATEUR À LA FILE
--------------------------------------------------- */
function addToQueue(streamer) {
    if (!queue.includes(streamer)) {
        queue.push(streamer);
        refreshQueue();
    }
}


/* ---------------------------------------------------
   EVENTS
--------------------------------------------------- */

// Bouton colonne gauche
addToQueueBtn.addEventListener("click", () => {
    addToQueue("gotaga"); // test
});

// Bouton sous le live
addBtnBottom.addEventListener("click", () => {
    addToQueue(currentStreamer);
});


/* ---------------------------------------------------
   INIT AU DÉMARRAGE
--------------------------------------------------- */
loadStreamer("gotaga");
refreshQueue();
