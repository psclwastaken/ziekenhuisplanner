const calendar = document.getElementById("calendar");
let reservations = {};

// Version
const APP_VERSION = '1.1.0';

// Supabase client
const SUPABASE_URL = 'https://pmrobschlimpfcbzpqzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtcm9ic2NobGltcGZjYnpwcXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMDk4ODMsImV4cCI6MjA5OTg4NTg4M30.-sjgQsgdNR34xyNiR_tary0Yzo99j3y9tJ1uYR3uWWU';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function isAuthenticated() {
    return sessionStorage.getItem('authenticated') === 'true';
}

function generateId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

async function loadReservations() {
    try {
        const { data, error } = await supabase
            .from('reservations')
            .select('*');
        
        if (error) throw error;
        
        reservations = {};
        data.forEach(r => {
            const key = `${r.date}-${r.period}`;
            if (!reservations[key]) {
                reservations[key] = [];
            }
            reservations[key].push({ id: r.id, name: r.name });
        });
        
        render();
    } catch (err) {
        console.error('Kon reservaties niet laden:', err);
        alert('Fout bij laden van reservaties');
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
        const middag = (reservations[`${date}-middag`] || []);
        const avond = (reservations[`${date}-avond`] || []);

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
    
    try {
        const { error } = await supabase
            .from('reservations')
            .insert([{
                date,
                period,
                name: name.trim()
            }]);
        
        if (error) throw error;
        
        await loadReservations();
    } catch (err) {
        console.error('Fout bij reserveren:', err);
        alert('Kon niet reserveren: ' + (err.message || 'onbekende fout'));
    }
}

async function removeReservation(date, period, id) {
    if (!isAuthenticated()) { alert('Alleen bekijken — login vereist om te verwijderen'); return; }
    
    try {
        const { error } = await supabase
            .from('reservations')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await loadReservations();
    } catch (err) {
        console.error('Fout bij verwijderen:', err);
        alert('Kon niet verwijderen: ' + (err.message || 'onbekende fout'));
    }
}

window.reserve = reserve;
window.removeReservation = removeReservation;

(function init() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { sessionStorage.removeItem('authenticated'); location.reload(); });

    // Set version in footer
    const versionEl = document.getElementById('version');
    if (versionEl) versionEl.textContent = APP_VERSION;

    // Load reservations on first open
    loadReservations();
})();
