async function loadNavbar() {
    const res = await fetch("/api/me");
    const data = await res.json();

    const navbar = document.getElementById("navbar");

    navbar.innerHTML = `
        <div class="nav-container">
            <div class="nav-left"></div>

            <div class="nav-right">
                ${
                    data.loggedIn
                    ? `
                        <img src="${data.user.avatar}" class="nav-avatar">
                        <span class="nav-name">${data.user.name}</span>
                        <button class="logout-btn" onclick="logout()">Déconnexion</button>
                    `
                    : `<button class="login-btn" onclick="openLoginPopup()">Se connecter</button>`
                }
            </div>
        </div>
    `;

    // Si connecté → cacher la popup automatiquement
    if (data.loggedIn) {
        closeLoginPopup();
    }
}

function openLoginPopup() {
    document.getElementById("loginPopup").classList.add("show");
}

function closeLoginPopup() {
    document.getElementById("loginPopup").classList.remove("show");
}

function loginWithTwitch() {
    window.location.href = "/auth/twitch";
}

function logout() {
    window.location.href = "/logout";
}

loadNavbar();
