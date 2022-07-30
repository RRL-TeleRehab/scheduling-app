const express = require("express");
const router = express.Router();

// import controllers
const {
  createAppointmentRequest,
  updateAppointmentRequest,
  getAppointmentsRequested,
  getRequestedAppointmentById,
  getConfirmedAppointmentById,
  getConfirmedAppointments,
  updateConfirmedAppointments,
  pendingRequestsByDate,
  getConfirmedAppointmentsByDateForClinician,
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
  userMiddleware,
  getAppointmentsRequested
);

router.get(
  "/confirmed-appointments",
  requireSignIn,
  userMiddleware,
  getConfirmedAppointments
);

router.put(
  "/confirmed-appointments/:appointmentId",
  requireSignIn,
  userMiddleware,
  updateConfirmedAppointments
);

router.get(
  "/request-appointment/:appointmentId",
  requireSignIn,
  userMiddleware,
  getRequestedAppointmentById
);

router.get(
  "/confirm-appointment/:appointmentId",
  requireSignIn,
  userMiddleware,
  getConfirmedAppointmentById
);

router.get(
  "/pending-requests/:clinicianId/:availabilityDate",
  requireSignIn,
  hubClinicianMiddleware,
  pendingRequestsByDate
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

router.get(
  "/confirmed-appointments/:availabilityDate",
  requireSignIn,
  userMiddleware,
  getConfirmedAppointmentsByDateForClinician
);

module.exports = router;
