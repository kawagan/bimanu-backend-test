const pool = require("../db");

async function upsertMany(records) {
  if (records.length === 0) return 0;

  const values = records.map((r) => [r.objectId, r.adresse, r.longitude, r.latitude]);

  const [result] = await pool.query(
    `INSERT INTO stations (object_id, adresse, longitude, latitude)
     VALUES ?
     ON DUPLICATE KEY UPDATE
       adresse = VALUES(adresse),
       longitude = VALUES(longitude),
       latitude = VALUES(latitude)`,
    [values]
  );

  return result.affectedRows;
}

async function findAll() {
  const [rows] = await pool.query(
    "SELECT object_id AS objectId, adresse, longitude, latitude FROM stations ORDER BY object_id"
  );
  return rows;
}

async function findById(objectId) {
  const [rows] = await pool.query(
    "SELECT object_id AS objectId, adresse, longitude, latitude FROM stations WHERE object_id = ?",
    [objectId]
  );
  return rows[0] || null;
}

async function findNextObjectId() {
  const [rows] = await pool.query("SELECT MAX(object_id) AS maxObjectId FROM stations");
  return (rows[0].maxObjectId || 0) + 1;
}

async function insert({ objectId, adresse, longitude, latitude }) {
  await pool.query(
    "INSERT INTO stations (object_id, adresse, longitude, latitude) VALUES (?, ?, ?, ?)",
    [objectId, adresse, longitude, latitude]
  );
}

async function update(objectId, { adresse, longitude, latitude }) {
  const [result] = await pool.query(
    "UPDATE stations SET adresse = ?, longitude = ?, latitude = ? WHERE object_id = ?",
    [adresse, longitude, latitude, objectId]
  );
  return result.affectedRows;
}

async function remove(objectId) {
  const [result] = await pool.query("DELETE FROM stations WHERE object_id = ?", [objectId]);
  return result.affectedRows;
}

// Returns stations within radiusKm of (lat, lng), using the Haversine formula against the DB
async function findNearby(lat, lng, radiusKm) {
  const [rows] = await pool.query(
    `SELECT object_id AS objectId, adresse, longitude, latitude,
            (6371 * ACOS(
              LEAST(1, GREATEST(-1,
                COS(RADIANS(?)) * COS(RADIANS(latitude)) *
                COS(RADIANS(longitude) - RADIANS(?)) +
                SIN(RADIANS(?)) * SIN(RADIANS(latitude))
              ))
            )) AS distanceKm
     FROM stations
     HAVING distanceKm <= ?
     ORDER BY distanceKm`,
    [lat, lng, lat, radiusKm]
  );
  return rows;
}

module.exports = {
  upsertMany,
  findAll,
  findById,
  findNextObjectId,
  insert,
  update,
  remove,
  findNearby,
};
