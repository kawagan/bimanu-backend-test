const { Router } = require("express");
const gasStationsRoutes = require("./gasStationsRoutes");

const router = Router();

router.use("/gasstations", gasStationsRoutes);

module.exports = router;
