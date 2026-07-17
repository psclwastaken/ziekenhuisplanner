const calendar = document.getElementById("calendar");
let reservations = {};
// GitHub raw URL - reliable CORS-enabled source
const REMOTE_JSON_URL = 'https://raw.githubusercontent.com/psclwastaken/ziekenhuisplanner/main/data/reservations.json';

function isAuthenticated() {
    return sessionStorage.getItem('authenticated') === 'true';
}

function generateId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

async function loadSample() {
    // Try remote Drive URL first, then fallback to bundled file
    const candidates = [REMOTE_JSON_URL, 'data/reservations.json'];
    for (const url of candidates) {
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Niet OK: ' + resp.status);
            const data = await resp.json();
            reservations = data.reservations || data || {};
            return;
        } catch (err) {
            console.warn('Kon niet laden van', url, err.message);
            // try next
        }
    }
    // All fell through
    console.error('Kon geen voorbeelddata laden vanaf remote of lokale bron.');
}

async function openJsonFile() {
    try {
        const data = await fileStorage.openFile();
        reservations = data.reservations || data || {};
        render();
    } catch (err) {
        console.error(err);
        alert(err.message || 'Kon bestand niet openen');
    }
}

async function saveReservations() {
    try {
        await fileStorage.saveFile({ reservations });
        alert('Opgeslagen');
    } catch (err) {
        console.error(err);
        alert('Opslaan mislukt: ' + (err.message || ''));
    }
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function render() {
    calendar.innerHTML = '';

    const weekdayNames = [
        'Zondag',
        'Maandag',
        'Dinsdag',
        'Woensdag',
        'Donderdag',
        'Vrijdag',
        'Zaterdag'
    ];

    const auth = isAuthenticated();
    const authEl = document.getElementById('authStatus');
    if (authEl) authEl.textContent = auth ? 'Ingelogd (bewerken toegestaan)' : 'Alleen bekijken';

    for (let day = 1; day <= 31; day++) {
        const date = `2026-07-${String(day).padStart(2, '0')}`;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayDate = new Date(date);
        dayDate.setHours(0, 0, 0, 0);

        if (dayDate < today) continue;

        const weekday = weekdayNames[dayDate.getDay()];
        const middag = (reservations[`${date}-middag`] || []).map(item => typeof item === 'string' ? { id: generateId(), name: item } : item);
        const avond = (reservations[`${date}-avond`] || []).map(item => typeof item === 'string' ? { id: generateId(), name: item } : item);

        reservations[`${date}-middag`] = middag;
        reservations[`${date}-avond`] = avond;

        const middagHtml = middag.length
            ? middag.map(res =>
                `<div class="reservation-line">
                    <span>${escapeHtml(res.name)}</span>
                    ${auth ? `<button class="remove-button" onclick="removeReservation('${date}','middag','${res.id}')">Verwijder</button>` : ''}
                </div>`
              ).join('')
            : 'Vrij';

        const avondHtml = avond.length
            ? avond.map(res =>
                `<div class="reservation-line">
                    <span>${escapeHtml(res.name)}</span>
                    ${auth ? `<button class="remove-button" onclick="removeReservation('${date}','avond','${res.id}')">Verwijder</button>` : ''}
                </div>`
              ).join('')
            : 'Vrij';

        calendar.innerHTML += `
            <div class="day">
                <h2>${weekday} ${day} juli</h2>
                <div class="block">
                    <h3>☀ Middag — 14:00 tot 15:00</h3>
                    <div class="reservation-list">${middagHtml}</div>
                    ${auth ? `<button onclick="reserve('${date}','middag')">Reserveer</button>` : ''}
                </div>
                <div class="block">
                    <h3>🌙 Avond — 18:30 tot 20:00</h3>
                    <div class="reservation-list">${avondHtml}</div>
                    ${auth ? `<button onclick="reserve('${date}','avond')">Reserveer</button>` : ''}
                </div>
            </div>`;
    }
}

async function reserve(date, period) {
    if (!isAuthenticated()) { alert('Alleen bekijken — login vereist om te reserveren'); return; }
    const name = prompt('Vul je naam in:');
    if (!name || !name.trim()) { alert('Ongeldige naam'); return; }
    const id = generateId();
    reservations[`${date}-${period}`] = reservations[`${date}-${period}`] || [];
    reservations[`${date}-${period}`].push({ id, name: name.trim() });
    render();
    try { await saveReservations(); } catch (_) {}
}

async function removeReservation(date, period, id) {
    if (!isAuthenticated()) { alert('Alleen bekijken — login vereist om te verwijderen'); return; }
    const arr = reservations[`${date}-${period}`] || [];
    const idx = arr.findIndex(r => r.id === id);
    if (idx === -1) return;
    arr.splice(idx, 1);
    reservations[`${date}-${period}`] = arr;
    render();
    try { await saveReservations(); } catch (_) {}
}

window.reserve = reserve;
window.removeReservation = removeReservation;

(function init() {
    const openBtn = document.getElementById('openFileBtn');
    if (openBtn) openBtn.addEventListener('click', openJsonFile);
    const loadBtn = document.getElementById('loadSampleBtn');
    if (loadBtn) loadBtn.addEventListener('click', async () => { await loadSample(); render(); });
    const saveBtn = document.getElementById('saveFileBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveReservations);
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { sessionStorage.removeItem('authenticated'); location.reload(); });

    // Try to load sample on first open so viewers see something
    loadSample().then(render).catch(err => { console.log(err); render(); });
})();
