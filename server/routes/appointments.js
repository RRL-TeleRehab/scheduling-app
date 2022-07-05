const express = require("express");
const router = express.Router();

// import controllers
const {
  createAppointmentRequest,
  updateAppointmentRequest,
  getAppointmentsRequestedToHubClinician,
  getRequestedAppointmentById,
  getConfirmedAppointments,
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
router.get(
  "/request-appointment",
  requireSignIn,
  hubClinicianMiddleware,
  getAppointmentsRequestedToHubClinician
);

router.get(
  "/confirmed-appointments",
  requireSignIn,
  userMiddleware,
  getConfirmedAppointments
);

router.get(
  "/request-appointment/:appointmentId",
  requireSignIn,
  userMiddleware,
  getRequestedAppointmentById
);

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
