if (
    sessionStorage.getItem("authenticated")
    !== "true"
) {
    window.location.href = "index.html";
}

const calendar = document.getElementById("calendar");
let reservations = {};

async function loadReservations() {
    try {
        const response = await fetch('/api/reservations');
        if (!response.ok) {
            throw new Error('Kan reserveringen niet laden');
        }
        const data = await response.json();
        reservations = data.reservations || {};
    } catch (error) {
        console.error(error);
        alert('Er is een fout opgetreden bij het laden van reserveringen.');
    }
}

async function reserve(date, period) {
    const name = prompt('Vul je naam in:');
    if (!name || !name.trim()) {
        alert('Ongeldige naam');
        return;
    }

    try {
        const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, period, name: name.trim() })
        });

        if (response.status === 409) {
            alert('Dit tijdstip is vol');
            return;
        }

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Kon reservering niet maken');
        }

        await loadReservations();
        render();
    } catch (error) {
        console.error(error);
        alert(error.message || 'Er is een fout opgetreden bij het reserveren.');
    }
}

async function removeReservation(date, period, index) {
    try {
        const response = await fetch('/api/reservations', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, period, index })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Kon reservering niet verwijderen');
        }

        await loadReservations();
        render();
    } catch (error) {
        console.error(error);
        alert(error.message || 'Er is een fout opgetreden bij het verwijderen van de reservering.');
    }
}

function escapeHtml(text) {
    return text
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

    for (let day = 1; day <= 31; day++) {
        const date = `2026-07-${String(day).padStart(2, '0')}`;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayDate = new Date(date);
        dayDate.setHours(0, 0, 0, 0);

        if (dayDate < today) {
            continue;
        }

        const weekday = weekdayNames[dayDate.getDay()];
        const middag = reservations[`${date}-middag`] || [];
        const avond = reservations[`${date}-avond`] || [];

        const middagHtml = middag.length
            ? middag.map((name, index) =>
                `<div class="reservation-line">
                    <span>${escapeHtml(name)}</span>
                    <button class="remove-button" onclick="removeReservation('${date}','middag',${index})">Verwijder</button>
                </div>`
              ).join('')
            : 'Vrij';

        const avondHtml = avond.length
            ? avond.map((name, index) =>
                `<div class="reservation-line">
                    <span>${escapeHtml(name)}</span>
                    <button class="remove-button" onclick="removeReservation('${date}','avond',${index})">Verwijder</button>
                </div>`
              ).join('')
            : 'Vrij';

        calendar.innerHTML += `
            <div class="day">
                <h2>${weekday} ${day} juli</h2>
                <div class="block">
                    <h3>☀ Middag — 14:00 tot 15:00</h3>
                    <div class="reservation-list">${middagHtml}</div>
                    <button onclick="reserve('${date}','middag')">Reserveer</button>
                </div>
                <div class="block">
                    <h3>🌙 Avond — 18:30 tot 20:00</h3>
                    <div class="reservation-list">${avondHtml}</div>
                    <button onclick="reserve('${date}','avond')">Reserveer</button>
                </div>
            </div>`;
    }
}

window.reserve = reserve;
window.removeReservation = removeReservation;

(async function () {
    await loadReservations();
    render();
})();
