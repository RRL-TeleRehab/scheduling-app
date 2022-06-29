const express = require("express");
const router = express.Router();

//import controllers
const {
  createAvailability,
  getClinicianAvailability,
} = require("../controllers/availability");

// middleware
const {
  requireSignIn,
  hubClinicianMiddleware,
  userMiddleware,
} = require("../controllers/auth");

router.post(
  "/availability",
  requireSignIn,
  hubClinicianMiddleware,
  createAvailability
);
router.get(
  "/availability/:clinicianId/:availabilityDate",
  requireSignIn,
  userMiddleware,
  getClinicianAvailability
);
module.exports = router;
