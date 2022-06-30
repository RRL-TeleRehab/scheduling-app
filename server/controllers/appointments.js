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
const { response } = require("express");

// @description :  Get Appointments of a clinician - pending, rejected or accepted
// @route GET /api/request-appointment
// @access Hub Clinician

exports.getAppointmentsRequestedToHubClinician = asyncHandler(
  async (req, res, next) => {
    const userId = req.user._id;
    const appointments = await requestedAppointment
      .find({
        requestedTo: userId,
        status: { $in: ["pending", "rejected"] },
      })
      .sort({ appointmentDate: 1 })
      .sort({ appointmentTime: 1 })
      .populate([
        {
          path: "requestedBy",
          model: "User",
          select: "firstName lastName email profilePhoto",
        },
        {
          path: "requestedTo",
          model: "User",
          select: "firstName lastName email profilePhoto",
        },
        {
          path: "requestedFor",
          model: "Patient",
          select: "firstName lastName email",
        },
      ]);
    if (!appointments) {
      return res.status(400).json({
        message: "No appointment found",
      });
    }
    res.status(200).json({ appointments });
  }
);

// @description :  Get requested Appointment details by appointmentId
// @route GET /api/request-appointment/:appointmentId
// @access Hub Clinician
exports.getRequestedAppointmentById = asyncHandler(async (req, res, next) => {
  const appointmentId = req.params.appointmentId;
  requestedAppointment
    .findById(appointmentId)
    .populate([
      {
        path: "requestedBy",
        model: "User",
        select:
          "firstName lastName email profilePhoto gender clinicContact clinicName",
      },
      {
        path: "requestedTo",
        model: "User",
        select:
          "firstName lastName email profilePhoto gender clinicContact clinicName",
      },
      {
        path: "requestedFor",
        model: "Patient",
        select: "firstName lastName email",
      },
    ])
    .exec((err, appointmentInfo) => {
      if (err || !appointmentInfo) {
        return res.status(400).json({
          error: "appointment details not found",
        });
      }
      res.status(200).json(appointmentInfo);
    });
});

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
  const patientInfo = await Patient.findOneAndUpdate(
    { email: patientEmail },
    { firstName: patientFirstName, lastName: patientLastName }
  );
  if (!patientInfo) {
    const createNewPatientInfo = await Patient.create({
      firstName: patientFirstName,
      lastName: patientLastName,
      email: patientEmail,
    });
    // console.log(createNewPatientInfo);
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
// @route PUT /api/request-appointment/:appointmentId
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
    // new record in requestedAppointmentHistory with status as 'rejected'
    // send email to requestedBy, requestedFor and requestedTo about appointment rejection status done by Hub Clinician

    // check if appointment exists based on appointmentId
    const appointmentRequestStatusUpdateInfo = await requestedAppointment
      .findByIdAndUpdate(
        req.params.appointmentId,
        { status: req.body.status },
        { new: true }
      )
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

    const appointmentRequestHistoryUpdateData = {
      requestedBy: appointmentRequestStatusUpdateInfo.requestedBy,
      requestedFor: appointmentRequestStatusUpdateInfo.requestedFor,
      requestedTo: appointmentRequestStatusUpdateInfo.requestedTo,
      status: appointmentRequestStatusUpdateInfo.status,
      appointmentDate: appointmentRequestStatusUpdateInfo.appointmentDate,
      appointmentTime: appointmentRequestStatusUpdateInfo.appointmentTime,
    };
    const appointmentRequestHistoryUpdate =
      await requestedAppointmentHistory.create(
        appointmentRequestHistoryUpdateData
      );

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
          <p> Clinic Address</p>
          <p> ${appointmentRequestStatusUpdateInfo.requestedTo.clinicAddress.streetAddress}</p>
          <p> ${appointmentRequestStatusUpdateInfo.requestedTo.clinicAddress.city}</p>
          <p> ${appointmentRequestStatusUpdateInfo.requestedTo.clinicAddress.province}</p>
          <p> ${appointmentRequestStatusUpdateInfo.requestedTo.clinicAddress.postalCode}</p>
          <p> ${appointmentRequestStatusUpdateInfo.requestedTo.clinicAddress.country}</p>
          <p>This email may contain sensitive information</p>
          <p>${process.env.CLIENT_URL}/</p>
          `,
    };
    sendEmailWithNodemailer(req, res, emailData);
    appointmentRequestStatusUpdateInfo.requestedBy = undefined;
    appointmentRequestStatusUpdateInfo.requestedFor = undefined;
    appointmentRequestStatusUpdateInfo.requestedTo = undefined;
    return res.status(200).json({
      message: "Appointment Rejected",
      appointmentRequestStatusUpdateInfo,
    });
  }
});
