const {
  requestedAppointment,
  requestedAppointmentHistory,
  appointments,
  appointmentsHistory,
} = require("../models/appointments");

// @description :  Create a new Appointment request to Hub Clinician by a spoke clinician for a patient at a particular date and slot time
// @route POST /api/request-appointment
// @access Spoke Clinician
exports.createAppointmentRequest = (req, res, next) => {
  res.send("Hello requested appointment successfully");
};
