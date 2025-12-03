// Nombre max de pubs par tirage
const MAX_ADS = 5;

// État du joueur (pour le moment, local)
let baseTicket = 0;      // 1 ticket quand il rejoint le tirage
let adTickets = 0;       // tickets gagnés via pubs
let adsWatched = 0;      // nombre de pubs regardées

// Récupération des éléments HTML
const totalTicketsSpan = document.getElementById('totalTickets');
const adTicketsSpan = document.getElementById('adTickets');
const adsWatchedSpan = document.getElementById('adsWatched');
const maxAdsSpan = document.getElementById('maxAds');
const joinDrawBtn = document.getElementById('joinDrawBtn');
const watchAdBtn = document.getElementById('watchAdBtn');
const runDrawBtn = document.getElementById('runDrawBtn');
const messageP = document.getElementById('message');

// Init
maxAdsSpan.textContent = MAX_ADS;
updateUI();

// Rejoindre le tirage (donne 1 ticket de base)
joinDrawBtn.addEventListener('click', () => {
    if (baseTicket === 1) {
        setMessage("Tu es déjà inscrit au tirage avec ton ticket de base.");
        return;
    }

    baseTicket = 1;
    updateUI();
    setMessage("Inscription au tirage réussie : tu as maintenant ton ticket de base.");
});

// Simule le visionnage d'une pub
watchAdBtn.addEventListener('click', () => {
    if (adsWatched >= MAX_ADS) {
        setMessage("Tu as déjà regardé le maximum de pubs pour ce tirage.");
        return;
    }

    // Ici plus tard tu brancheras la vraie pub (rewarded ad)
    adsWatched++;
    adTickets++;

    updateUI();
    setMessage("Pub regardée ! Tu as gagné 1 ticket supplémentaire.");
});

// Lancer le tirage (test local)
runDrawBtn.addEventListener('click', () => {
    const totalTickets = getTotalTickets();

    if (totalTickets <= 0) {
        setMessage("Tu n'as aucun ticket. Inscris-toi et regarde des pubs avant de lancer un tirage de test.");
        return;
    }

    // Pour l'instant, on simule un tirage où tu es le seul participant.
    // Plus tard, on gèrera plusieurs joueurs.
    setMessage(`Tirage de test effectué avec ${totalTickets} tickets. Résultat : tu aurais GAGNÉ (simulation).`);
});

// Met à jour les compteurs affichés
function updateUI() {
    const totalTickets = getTotalTickets();
    totalTicketsSpan.textContent = totalTickets;
    adTicketsSpan.textContent = adTickets;
    adsWatchedSpan.textContent = adsWatched;

    // Désactiver le bouton pub si on a atteint la limite
    watchAdBtn.disabled = adsWatched >= MAX_ADS;
}

// Calcule le total de tickets
function getTotalTickets() {
    return baseTicket + adTickets;
}

// Affiche un message texte
function setMessage(text) {
    messageP.textContent = text;
}
