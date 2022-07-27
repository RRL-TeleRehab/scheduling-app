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
const User = require("../models/user");

// @description :  Get Appointments of a clinician - pending, rejected or accepted
// @route GET /api/request-appointment
// @access Hub Clinician

exports.getAppointmentsRequested = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { role } = await User.findById(userId);
  let query;
  if (role === "hub") {
    query = {
      requestedTo: userId,
      status: { $in: ["pending", "rejected"] },
    };
  } else {
    query = {
      requestedBy: userId,
      status: { $in: ["pending", "rejected"] },
    };
  }
  const appointments = await requestedAppointment
    .find(query)
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
});

// @description :  Get requested Appointment details by appointmentId
// @route GET /api/request-appointment/:appointmentId
// @access Hub and Spoke Clinician
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

// @description :  Get Confirmed Appointment details by appointmentId
// @route GET /api/confirm-appointment/:appointmentId
// @access Hub and Spoke Clinician

exports.getConfirmedAppointmentById = asyncHandler(async (req, res, next) => {
  const appointmentId = req.params.appointmentId;
  appointments
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
  console.log(req.body);
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
    { firstName: patientFirstName, lastName: patientLastName },
    { upsert: true, new: true, setDefaultsOnInsert: true }
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
    message: "Appointment requested successfully",
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
    // a new record in requestedAppointmentHistory with status as 'Accepted'
    const appointmentRequestStatusUpdateInfo = await requestedAppointment
      .findOneAndUpdate(
        { _id: req.params.appointmentId },
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

    // A new record in appointments 'active'
    // a new record in appointmentsHistory with status 'active'
    const appointmentConfirmationData = {
      requestedBy: appointmentRequestStatusUpdateInfo.requestedBy,
      requestedFor: appointmentRequestStatusUpdateInfo.requestedFor,
      requestedTo: appointmentRequestStatusUpdateInfo.requestedTo,
      appointmentDate: appointmentRequestStatusUpdateInfo.appointmentDate,
      appointmentTime: appointmentRequestStatusUpdateInfo.appointmentTime,
    };
    //use findOneAndUpdate to avoid the duplication
    const confirmedAppointment = await appointments.create(
      appointmentConfirmationData
    );
    const appointmentConfirmationDataHistory = {
      requestedBy: appointmentRequestStatusUpdateInfo.requestedBy,
      requestedFor: appointmentRequestStatusUpdateInfo.requestedFor,
      requestedTo: appointmentRequestStatusUpdateInfo.requestedTo,
      appointmentDate: appointmentRequestStatusUpdateInfo.appointmentDate,
      appointmentTime: appointmentRequestStatusUpdateInfo.appointmentTime,
    };
    const confirmedAppointmentHistory = await appointmentsHistory.create(
      appointmentConfirmationDataHistory
    );

    // send email confirmation for the approved Appointment

    const approvedEmailData = {
      from: process.env.EMAIL_FROM,
      to: [
        appointmentRequestStatusUpdateInfo.requestedBy.email,
        appointmentRequestStatusUpdateInfo.requestedFor.email,
      ],
      subject: `Thank you for choosing PROMOTE. Appointment confirmed by ${appointmentRequestStatusUpdateInfo.requestedTo.firstName} ${appointmentRequestStatusUpdateInfo.requestedTo.lastName}`,
      html: `
          <p>Your appointment with ID:  ${appointmentRequestStatusUpdateInfo._id}
          on ${appointmentRequestStatusUpdateInfo.appointmentDate} at ${appointmentRequestStatusUpdateInfo.appointmentTime} 
          has been confirmed. You are all set to meet your doctor. </p>
          <p>Patient Details</p>
          <h6>${appointmentRequestStatusUpdateInfo.requestedFor.firstName}</h6>
          <h6>${appointmentRequestStatusUpdateInfo.requestedFor.lastName}</h6>
          <h6>${appointmentRequestStatusUpdateInfo.requestedFor.email}</h6>
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
    sendEmailWithNodemailer(req, res, approvedEmailData);

    // update the availability of the Hub Clinician for the requested appointment time and date
    const clinicianAvailabilitySlotUpdate = await Availability.updateOne(
      {
        clinicianId: appointmentRequestStatusUpdateInfo.requestedTo,
        availability: {
          $elemMatch: {
            date: new Date(appointmentRequestStatusUpdateInfo.appointmentDate),
            "slots.time": appointmentRequestStatusUpdateInfo.appointmentTime,
          },
        },
      },
      {
        $set: {
          "availability.$[outer].slots.$[inner].isAvailable": false,
        },
      },
      {
        arrayFilters: [
          {
            "outer.date": new Date(
              appointmentRequestStatusUpdateInfo.appointmentDate
            ),
          },
          { "inner.time": appointmentRequestStatusUpdateInfo.appointmentTime },
        ],
      }
    );

    // cancel other appointment requests for the requested appointment time --> update status and send an email to the cancelled appointment Spoke Clinicians
    const pendingRequestedAppointments = await requestedAppointment
      .find({
        requestedTo: appointmentRequestStatusUpdateInfo.requestedTo,
        appointmentDate: appointmentRequestStatusUpdateInfo.appointmentDate,
        appointmentTime: appointmentRequestStatusUpdateInfo.appointmentTime,
        status: "pending",
      })
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

    console.log(pendingRequestedAppointments);
    // send email to Spoke Clinician and patient about the cancellation of the request
    pendingRequestedAppointments.map(async (appointment) => {
      const updateRequestAppointment = await requestedAppointment.updateOne(
        {
          requestedBy: appointment.requestedBy._id,
          requestedTo: appointment.requestedTo._id,
          status: "pending",
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
        },
        { $set: { status: "rejected" } }
      );
      const rejectionEmailData = {
        from: process.env.EMAIL_FROM,
        to: [appointment.requestedBy.email, appointment.requestedFor.email],
        subject: `Thank you for choosing PROMOTE. Appointment Cancelled by ${appointment.requestedTo.firstName} ${appointment.requestedTo.lastName}`,
        html: `
            <p>Unfortunately your appointment:  ${appointment._id}
            on ${appointment.appointmentDate} at ${appointment.appointmentTime}
            has been cancelled. please rebook again</p>
            <p>Patient Details</p>
            <h6>${appointment.requestedFor.firstName}</h6>
            <h6>${appointment.requestedFor.lastName}</h6>
            <h6>${appointment.requestedFor.email}</h6>
            <p> Clinic Address</p>
            <p> ${appointment.requestedTo.clinicAddress.streetAddress}</p>
            <p> ${appointment.requestedTo.clinicAddress.city}</p>
            <p> ${appointment.requestedTo.clinicAddress.province}</p>
            <p> ${appointment.requestedTo.clinicAddress.postalCode}</p>
            <p> ${appointment.requestedTo.clinicAddress.country}</p>
            <p>This email may contain sensitive information</p>
            <p>${process.env.CLIENT_URL}/</p>
            `,
      };
      sendEmailWithNodemailer(req, res, rejectionEmailData);
    });

    return res.status(200).json("Appointment has been approved");
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

// @description :  Confirmed appointments of HUB Clinician
// @route GET /hub/bookings
// @access Hub Clinician and Spoke Clinician

exports.getConfirmedAppointments = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { role } = await User.findById(req.user._id);
  let query;
  if (role === "hub") {
    query = { requestedTo: userId };
  }
  if (role === "spoke") {
    query = { requestedBy: userId };
  }
  const confirmedBookings = await appointments.find(query).populate([
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
  ]);
  if (!confirmedBookings)
    return res.status(404).json({
      message: "No bookings found",
    });
  res.status(200).json({ confirmedBookings });
});

// @description :  Get pending appointment requests by Date
// @route GET /pending-requests/:clinicianId/:availabilityDate
// @access Hub Clinician

exports.pendingRequestsByDate = asyncHandler(async (req, res, next) => {
  try {
    const clinicianId = req.params.clinicianId;
    const availabilityDate = req.params.availabilityDate;
    const pendingAppointmentRequests = await requestedAppointment.find({
      requestedTo: clinicianId,
      appointmentDate: new Date(availabilityDate),
      status: "pending",
    });
    if (!pendingAppointmentRequests) {
      return next(
        new ErrorResponse(
          `No pending appointment requests found on ${availabilityDate}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      count: pendingAppointmentRequests.length,
      pendingAppointmentRequests: pendingAppointmentRequests,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});
