const {
  fetchGasStations,
  syncGasStations,
  getAllGasStations,
  getGasStationsNearby,
  getGasStationById,
  createGasStation,
  updateGasStation,
  deleteGasStation,
} = require("../services/gasStationsService");

// Fetches gas stations from the Koeln open data API and stores/updates them in MySQL
async function sync(req, res) {
  try {
    const result = await syncGasStations();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Fetches gas stations from the Koeln open data API without persisting to MySQL
async function preview(req, res) {
  try {
    const records = await fetchGasStations();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAll(req, res) {
  try {
    const gasStations = await getAllGasStations();
    res.json(gasStations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Returns gas stations within `radius` km of (`lat`, `lng`), e.g. ?lat=50.916&lng=6.9606&radius=5
async function getNearby(req, res) {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radius)) {
    return res.status(400).json({ error: "lat, lng and radius must be valid numbers" });
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180 || radius <= 0) {
    return res.status(400).json({ error: "lat/lng out of range or radius must be positive" });
  }

  if (![2, 5, 10].includes(radius)) {
    return res.status(400).json({ error: "radius must be 2, 5 or 10 km" });
  }

  try {
    const gasStations = await getGasStationsNearby(lat, lng, radius);
    res.json(gasStations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getById(req, res) {
  const objectId = Number(req.params.objectId);
  if (!Number.isFinite(objectId)) {
    return res.status(400).json({ error: "objectId must be a valid number" });
  }

  try {
    const gasStation = await getGasStationById(objectId);
    if (!gasStation) {
      return res.status(404).json({ error: "Station not found" });
    }
    res.json(gasStation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  const { adresse, longitude, latitude } = req.body;

  if (
    typeof adresse !== "string" ||
    !adresse.trim() ||
    !Number.isFinite(Number(longitude)) ||
    !Number.isFinite(Number(latitude))
  ) {
    return res.status(400).json({ error: "adresse, longitude and latitude are required and must be valid" });
  }

  try {
    const gasStation = await createGasStation({
      adresse,
      longitude: Number(longitude),
      latitude: Number(latitude),
    });
    res.status(201).json(gasStation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function update(req, res) {
  const objectId = Number(req.params.objectId);
  const { adresse, longitude, latitude } = req.body;

  if (!Number.isFinite(objectId)) {
    return res.status(400).json({ error: "objectId must be a valid number" });
  }

  if (
    typeof adresse !== "string" ||
    !adresse.trim() ||
    !Number.isFinite(Number(longitude)) ||
    !Number.isFinite(Number(latitude))
  ) {
    return res.status(400).json({ error: "adresse, longitude and latitude are required and must be valid" });
  }

  try {
    const gasStation = await updateGasStation(objectId, {
      adresse,
      longitude: Number(longitude),
      latitude: Number(latitude),
    });
    if (!gasStation) {
      return res.status(404).json({ error: "Station not found" });
    }
    res.json(gasStation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  const objectId = Number(req.params.objectId);
  if (!Number.isFinite(objectId)) {
    return res.status(400).json({ error: "objectId must be a valid number" });
  }

  try {
    const deleted = await deleteGasStation(objectId);
    if (!deleted) {
      return res.status(404).json({ error: "Station not found" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  sync,
  preview,
  getAll,
  getNearby,
  getById,
  create,
  update,
  remove,
};
