const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'reservations.json');
const MAX_RESERVATIONS_PER_SLOT = 2;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch (err) {
    const initialData = { reservations: {} };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

async function loadData() {
  await ensureDataFile();
  const file = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(file);
}

async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api/reservations', async (req, res) => {
  try {
    const data = await loadData();
    res.json({ reservations: data.reservations || {} });
  } catch (err) {
    console.error('Failed to load reservations', err);
    res.status(500).json({ error: 'Failed to load reservations' });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const { date, period, name } = req.body;
    if (!date || !period || !name || !name.trim()) {
      return res.status(400).json({ error: 'Invalid reservation data' });
    }

    const key = `${date}-${period}`;
    const data = await loadData();
    const reservations = data.reservations || {};
    if (!reservations[key]) {
      reservations[key] = [];
    }

    if (reservations[key].length >= MAX_RESERVATIONS_PER_SLOT) {
      return res.status(409).json({ error: 'Slot is full' });
    }

    reservations[key].push(name.trim());
    data.reservations = reservations;
    await saveData(data);

    res.json({ reservations });
  } catch (err) {
    console.error('Failed to save reservation', err);
    res.status(500).json({ error: 'Failed to save reservation' });
  }
});

app.delete('/api/reservations', async (req, res) => {
  try {
    const { date, period, index } = req.body;
    if (!date || !period || typeof index !== 'number') {
      return res.status(400).json({ error: 'Invalid reservation delete request' });
    }

    const key = `${date}-${period}`;
    const data = await loadData();
    const reservations = data.reservations || {};
    const slot = reservations[key];

    if (!slot || index < 0 || index >= slot.length) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    slot.splice(index, 1);
    if (slot.length === 0) {
      delete reservations[key];
    }

    data.reservations = reservations;
    await saveData(data);

    res.json({ reservations });
  } catch (err) {
    console.error('Failed to delete reservation', err);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
