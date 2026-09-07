const { Router } = require("express");
const gasStationsController = require("../controllers/gasStationsController");

const router = Router();

router.post("/sync", gasStationsController.sync);
router.get("/preview", gasStationsController.preview);
router.get("/nearby", gasStationsController.getNearby);
router.get("/:objectId", gasStationsController.getById);
router.get("/", gasStationsController.getAll);
router.post("/", gasStationsController.create);
router.put("/:objectId", gasStationsController.update);
router.delete("/:objectId", gasStationsController.remove);

module.exports = router;
