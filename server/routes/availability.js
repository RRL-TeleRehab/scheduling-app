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

// validators
router.post(
  "/availability",
  requireSignIn,
  hubClinicianMiddleware,
  createAvailability
);
router.get(
  "/availability/:clinicianId",
  requireSignIn,
  userMiddleware,
  getClinicianAvailability
);
module.exports = router;
