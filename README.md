# bimanu-test

Express API for syncing and querying gas stations from the Cologne (Köln) open data portal, backed by MySQL.

## Project structure

```
app.js                        # Entry point, starts the HTTP server
src/
  app.js                      # Express app setup (middleware, routes, error handler)
  db/
    index.js                  # MySQL connection pool
  routes/
    index.js                  # Mounts feature routers under /api
    gasStationsRoutes.js       # /api/gasstations endpoints
  controllers/
    gasStationsController.js  # Request/response handling, input validation
  services/
    gasStationsService.js     # Business logic (fetch from external API, orchestration)
  models/
    gasStationModel.js        # Raw SQL / data access for the `stations` table
  jobs/
    gasStationsSyncJob.js      # Standalone script to trigger a sync manually
migrations/
  create_tankstellen_table.sql # Creates the `stations` table
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your MySQL credentials:
   ```bash
   cp .env.example .env
   ```
3. Create the database schema by running the SQL in `migrations/create_tankstellen_table.sql` against your MySQL instance.

## Running

```bash
npm start   # run once
npm run dev # run with nodemon (auto-restart on changes)
```

The server listens on `PORT` (default `3000`).

## Testing

```bash
npm test
```

## API

All routes are mounted under `/api`.

| Method | Path                         | Description                                                                           |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------- |
| POST   | `/api/gasstations/sync`      | Fetches stations from the Köln open data API and upserts them into MySQL              |
| GET    | `/api/gasstations/preview`   | Fetches stations from the API without persisting them                                 |
| GET    | `/api/gasstations/nearby`    | Returns stations within `radius` km of `lat`/`lng` (radius must be `2`, `5`, or `10`) |
| GET    | `/api/gasstations`           | Returns all stations                                                                  |
| GET    | `/api/gasstations/:objectId` | Returns a single station                                                              |
| POST   | `/api/gasstations`           | Creates a station (`adresse`, `longitude`, `latitude`)                                |
| PUT    | `/api/gasstations/:objectId` | Updates a station                                                                     |
| DELETE | `/api/gasstations/:objectId` | Deletes a station                                                                     |

### Example: nearby search

```
GET /api/gasstations/nearby?lat=50.9375&lng=6.9603&radius=5
```

## Manual sync job

To resync the `stations` table with the open data API without going through HTTP:

```bash
node src/jobs/gasStationsSyncJob.js
```
