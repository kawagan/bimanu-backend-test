const { syncGasStations } = require("../services/gasStationsService");

// Re-syncs the stations table with the Koeln open data API. Run manually via
// `node src/jobs/gasStationsSyncJob.js` or wire it up to a scheduler (e.g. node-cron).
async function runGasStationsSync() {
  const result = await syncGasStations();
  console.log(`Gas stations sync completed: ${JSON.stringify(result)}`);
  return result;
}

if (require.main === module) {
  runGasStationsSync()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`Gas stations sync failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runGasStationsSync };
