const gasStationModel = require("../models/gasStationModel");

// Cologne Geoportal ArcGIS endpoint
const GASSTATIONS_API_URL =
  "https://geoportal.stadt-koeln.de/arcgis/rest/services/verkehr/gefahrgutstrecken/MapServer/0/query" +
  "?where=objectid+is+not+null&outFields=*&returnGeometry=true&outSR=4326&f=json";

async function fetchGasStations() {
  const res = await fetch(GASSTATIONS_API_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch gas stations data: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const features = data.features || [];

  return features.map((feature) => ({
    objectId: feature.attributes.objectid,
    adresse: feature.attributes.adresse,
    longitude: feature.geometry.x,
    latitude: feature.geometry.y,
  }));
}

async function saveGasStations(records) {
  return gasStationModel.upsertMany(records);
}

async function syncGasStations() {
  const records = await fetchGasStations();
  const affectedRows = await saveGasStations(records);
  return { fetched: records.length, affectedRows };
}

async function getAllGasStations() {
  return gasStationModel.findAll();
}

async function getGasStationById(objectId) {
  return gasStationModel.findById(objectId);
}

async function getNextObjectId() {
  return gasStationModel.findNextObjectId();
}

async function createGasStation({ adresse, longitude, latitude }) {
  const objectId = await gasStationModel.findNextObjectId();
  await gasStationModel.insert({ objectId, adresse, longitude, latitude });
  return gasStationModel.findById(objectId);
}

async function updateGasStation(objectId, { adresse, longitude, latitude }) {
  const affectedRows = await gasStationModel.update(objectId, { adresse, longitude, latitude });
  if (affectedRows === 0) return null;
  return gasStationModel.findById(objectId);
}

async function deleteGasStation(objectId) {
  const affectedRows = await gasStationModel.remove(objectId);
  return affectedRows > 0;
}

async function getGasStationsNearby(lat, lng, radiusKm) {
  return gasStationModel.findNearby(lat, lng, radiusKm);
}

module.exports = {
  GASSTATIONS_API_URL,
  fetchGasStations,
  saveGasStations,
  syncGasStations,
  getGasStationsNearby,
  getAllGasStations,
  getGasStationById,
  createGasStation,
  updateGasStation,
  deleteGasStation,
  getNextObjectId,
};
