const express = require("express");
const router = express.Router();

// import controllers
const {
  createAppointmentRequest,
  updateAppointmentRequest,
} = require("../controllers/appointments");

// import middleware
const {
  requireSignIn,
  spokeClinicianMiddleware,
  userMiddleware,
  hubClinicianMiddleware,
} = require("../controllers/auth");

// import validators

// routes

router.post(
  "/request-appointment",
  requireSignIn,
  spokeClinicianMiddleware,
  createAppointmentRequest
);

router.put(
  "/request-appointment/:appointmentId",
  requireSignIn,
  hubClinicianMiddleware,
  updateAppointmentRequest
);

module.exports = router;
