const {
  requestedAppointment,
  requestedAppointmentHistory,
  appointments,
  appointmentsHistory,
} = require("../models/appointments");
const asyncHandler = require("../helpers/async");
const ErrorResponse = require("../helpers/ErrorResponse");
const { sendEmailWithNodemailer } = require("../helpers/email");
const Patient = require("../models/patient");
const Availability = require("../models/availability");

// @description :  Create a new Appointment request to Hub Clinician by a spoke clinician for a patient at a particular date and slot time
// @route POST /api/request-appointment
// @access Spoke Clinician
exports.createAppointmentRequest = asyncHandler(async (req, res, next) => {
  // when an appointment request is sent by spoke clinician, a record in both requestedAppointment and requestedAppointmentHistory is added

  const {
    requestedBy,
    requestedTo,
    appointmentStatus,
    patientFirstName,
    patientLastName,
    patientEmail,
    appointmentDate,
    appointmentTime,
  } = req.body;
  let patientData = {};

  // check if patient Already exists otherwise add patient data to DB
  const patientInfo = await Patient.findOne({ email: patientEmail });
  if (!patientInfo) {
    const createNewPatientInfo = await Patient.create({
      firstName: patientFirstName,
      lastName: patientLastName,
      email: patientEmail,
    });
    console.log(createNewPatientInfo);
    patientData = createNewPatientInfo;
  }
  patientData = patientInfo;
  console.log(patientData._id);

  const appointmentData = {
    requestedBy,
    requestedFor: patientData._id,
    requestedTo,
    status: appointmentStatus,
    appointmentDate,
    appointmentTime,
  };
  const appointmentRequest = await requestedAppointment.create(appointmentData);
  const appointmentRequestHistory = await requestedAppointmentHistory.create(
    appointmentData
  );
  res.status(200).json({
    message: "Appointment requested",
    appointmentRequest,
  });
});

// @description :  Update a appointment request status which is sent by Spoke Clinician to Hub Clinician for a patient at a particular date and slot time
// @route PUT /api/request-appointment/:id
// @access Hub Clinician
exports.updateAppointmentRequest = asyncHandler(async (req, res, next) => {
  if (req.body.status === "accepted") {
    // @Case1: Appointment request accepted
    // when an appointment status is changed to accepted by Hub clinician,
    // a record update in requestedAppointment with status as 'Accepted'
    //  new record in requestedAppointmentHistory with status as 'Accepted'
    // A new record in appointments 'active'
    // a new record in appointmentsHistory with status 'active'
    // update the availability of the Hub Clinician for the requested appointment time and date
    // cancel other appointment requests for the requested appointment time and send an email to the cancelled appointment Spoke Clinicians
    // send email to requestedBy, requestedFor and requestedTo about appointment confirmation
  } else {
    // @Case2: Appointment request rejected
    // when an appointment status is changed to rejected by Hub clinician,
    // a record update in requestedAppointment with status as 'rejected'
    //  new record in requestedAppointmentHistory with status as 'rejected'

    // check if appointment exists based on appointmentId
    const appointmentRequestStatusUpdateInfo = await requestedAppointment
      .findByIdAndUpdate(req.params.appointmentId, req.body, { new: true })
      .populate([
        {
          path: "requestedBy",
          model: "User",
          select: "firstName lastName email clinicContact clinicAddress",
        },
        {
          path: "requestedTo",
          model: "User",
          select: "firstName lastName email clinicContact clinicAddress",
        },
        {
          path: "requestedFor",
          model: "Patient",
          select: "firstName lastName email",
        },
      ]);
    if (!appointmentRequestStatusUpdateInfo) {
      return res.status(404).json({
        message: `No appointment found with Id ${req.params.appointmentId}`,
      });
    }
    const appointmentRequestHistoryUpdate =
      await requestedAppointmentHistory.create(req.body);

    // send email for appointment rejection
    emailList = [
      appointmentRequestStatusUpdateInfo.requestedBy.email,
      appointmentRequestStatusUpdateInfo.requestedFor.email,
      appointmentRequestStatusUpdateInfo.requestedTo.email,
    ];
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: emailList,
      subject: `Thank you for choosing PROMOTE. Appointment not available`,
      html: `
          <p>Unfortunately your appointment :  ${appointmentRequestStatusUpdateInfo._id} 
          on ${appointmentRequestStatusUpdateInfo.appointmentDate} at ${appointmentRequestStatusUpdateInfo.appointmentTime} 
          has been cancelled. please rebook again</p>
          <p>This email may contain sensitive information</p>
          <p>${process.env.CLIENT_URL}/</p>
          `,
    };
    sendEmailWithNodemailer(req, res, emailData);
    return res.status(200).json({
      message: "Appointment Rejected",
      data: appointmentRequestStatusUpdateInfo,
    });
  }
});
