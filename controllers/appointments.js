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
const cron = require("node-cron");
const redisClient = require("../helpers/cacheManager");

const appointmentsFilter = [
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
];

// @description :  Get Appointments of a clinician - pending, rejected or accepted
// @route GET /api/request-appointment
// @access Hub Clinician

exports.getAppointmentsRequested = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  try {
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
    redisClient.get(
      `requestedAppointments-${userId}`,
      async (err, response) => {
        if (response) {
          console.log(
            `Requested Appointments for ${userId} successfully retrieved from cache`
          );
          res.status(200).send({ appointments: JSON.parse(response) });
        } else {
          const appointments = await requestedAppointment
            .find(query)
            .sort({ appointmentDate: "desc" })
            .sort({ appointmentTime: "desc" })
            .populate(appointmentsFilter);
          if (!appointments) {
            return res.status(400).json({
              message: "No appointment found",
            });
          }
          redisClient.setex(
            `requestedAppointments-${userId}`,
            10,
            JSON.stringify(appointments)
          );
          console.log(
            "Requested Appointments successfully retrieved from the API"
          );
          res.status(200).json({ appointments });
        }
      }
    );
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// @description :  Get requested Appointment details by appointmentId
// @route GET /api/request-appointment/:appointmentId
// @access Hub and Spoke Clinician
exports.getRequestedAppointmentById = asyncHandler(async (req, res, next) => {
  const appointmentId = req.params.appointmentId;
  requestedAppointment
    .findById(appointmentId)
    .populate(appointmentsFilter)
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
    .populate(appointmentsFilter)
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
    // @Case1: Appointment request : accepted
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

// @description : Update confirmed Appointments status to: completed, cancelled, modified
// @route PUT /confirmed-appointments/:appointmentId
// @access Hub & Spoke Clinician

exports.updateConfirmedAppointments = asyncHandler(async (req, res, next) => {
  let { status } = req.body;
  let appointmentId = req.params.appointmentId;
  if (status === "fulfilled") {
    // update the appointment status to fulfilled
    // create a new record into appointment history
    // send email to patient and Spoke clinician about appointment completion
    const appointmentUpdateInfo = await appointments
      .findByIdAndUpdate(
        appointmentId,
        { status: req.body.status },
        { new: true }
      )
      .populate([
        {
          path: "requestedBy",
          model: "User",
          select: "firstName lastName email clinicName",
        },
        {
          path: "requestedTo",
          model: "User",
          select: "firstName lastName email clinicName",
        },
        {
          path: "requestedFor",
          model: "Patient",
          select: "firstName lastName email",
        },
      ]);
    if (!appointmentUpdateInfo) {
      return next(
        new ErrorResponse(`No appointment found with Id ${appointmentId}`, 404)
      );
    }
    const updateAppointmentHistoryData = {
      requestedBy: appointmentUpdateInfo.requestedBy._id,
      requestedFor: appointmentUpdateInfo.requestedFor._id,
      requestedTo: appointmentUpdateInfo.requestedTo._id,
      appointmentDate: appointmentUpdateInfo.appointmentDate,
      appointmentTime: appointmentUpdateInfo.appointmentTime,
      status: appointmentUpdateInfo.status,
    };
    const updateAppointmentHistory = await appointmentsHistory.create(
      updateAppointmentHistoryData
    );
    // send email for appointment completion
    let emailData = {
      from: process.env.EMAIL_FROM,
      to: [
        appointmentUpdateInfo.requestedBy.email,
        appointmentUpdateInfo.requestedFor.email,
      ],
      subject: `Thank you for choosing PROMOTE. Appointment completed`,
      html: `
          <p>Your appointment :  ${appointmentUpdateInfo._id}
          on ${appointmentUpdateInfo.appointmentDate} at ${appointmentUpdateInfo.appointmentTime}
          has been completed. I hope you had a great experience. Please visit us again</p>
          <p>${process.env.CLIENT_URL}/</p>
          `,
    };
    sendEmailWithNodemailer(req, res, emailData);
    res.status(200).json({
      success: true,
      message: "Appointment status updated",
    });
  }
  if (status === "modified") {
    // update old availability of the Hub clinician if time and date is valid
    // update the old appointment request status to pending with new time and date
    // Add a new record in request appointment history with new appointment date, time and status as pending
    // remove the confirmed appointment from the appointments collection
    // add new record in appointmentHistory with status as modified.
    // Send email to the patient, Spoke and Hub clinician about the new appointment request details

    const {
      appointmentDate,
      appointmentTime,
      selectedTimeSlot,
      newAppointmentRequestDate,
      requestedTo,
      requestedBy,
      requestedFor,
    } = req.body;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    let minutes = today.getMinutes();
    let hours = today.getHours();
    today = mm + "-" + dd + "-" + yyyy;
    minutes = minutes <= 9 ? "0" + minutes : minutes;
    hours = hours <= 9 ? "0" + hours : hours;
    var currentTime = hours + ":" + minutes;

    // update the old availability of the Hub clinician if time and date is valid

    // for future date
    if (appointmentDate > today) {
      const clinicianAvailabilityOldSlotUpdate = await Availability.updateOne(
        {
          clinicianId: requestedTo,
          availability: {
            $elemMatch: {
              date: new Date(appointmentDate),
              "slots.time": appointmentTime,
            },
          },
        },
        {
          $set: {
            "availability.$[outer].slots.$[inner].isAvailable": true,
          },
        },
        {
          arrayFilters: [
            {
              "outer.date": new Date(appointmentDate),
            },
            {
              "inner.time": appointmentTime,
            },
          ],
        }
      );
    }
    // current date
    if (appointmentDate === today) {
      if (appointmentTime > currentTime) {
        const clinicianAvailabilityOldSlotUpdate = await Availability.updateOne(
          {
            clinicianId: requestedTo,
            availability: {
              $elemMatch: {
                date: new Date(appointmentDate),
                "slots.time": appointmentTime,
              },
            },
          },
          {
            $set: {
              "availability.$[outer].slots.$[inner].isAvailable": true,
            },
          },
          {
            arrayFilters: [
              {
                "outer.date": new Date(appointmentDate),
              },
              {
                "inner.time": appointmentTime,
              },
            ],
          }
        );
      }
    }

    // update the old appointment request status to pending with new time and date
    const updateRequestAppointment = await requestedAppointment
      .findOneAndUpdate(
        {
          requestedTo: requestedTo,
          requestedBy: requestedBy,
          requestedFor: requestedFor,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          status: "accepted",
        },
        {
          status: "pending",
          appointmentDate: newAppointmentRequestDate,
          appointmentTime: selectedTimeSlot,
        },
        { new: true }
      )
      .populate(appointmentsFilter);

    // Add a new record in appointment request history with new appointment date, time and status as pending

    const updateRequestAppointmentHistory =
      await requestedAppointmentHistory.create({
        requestedTo: requestedTo,
        requestedBy: requestedBy,
        requestedFor: requestedFor,
        appointmentDate: newAppointmentRequestDate,
        appointmentTime: selectedTimeSlot,
        status: "pending",
      });

    // remove the confirmed appointment from the appointments collection
    const removeConfirmedAppointment = await appointments.findByIdAndRemove(
      appointmentId
    );

    //add new record in appointmentHistory with status as modified.
    const updateAppointmentHistory = await appointmentsHistory.create({
      requestedTo: requestedTo,
      requestedBy: requestedBy,
      requestedFor: requestedFor,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      status: "modified",
    });

    const emailList = [
      updateRequestAppointment.requestedBy.email,
      updateRequestAppointment.requestedFor.email,
    ];

    // send email to patient and Spoke clinician about appointment modification with new data and appointment time
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: emailList,
      subject: `Thank you for choosing PROMOTE. Appointment rescheduled`,
      html: `
          <p>Your appointment :  ${appointmentId} on ${appointmentDate} at ${appointmentTime} has been rescheduled. </p>
          <p>New request submitted on ${newAppointmentRequestDate} at ${selectedTimeSlot}</p>
          <p>This email may contain sensitive information</p>
          <p>${process.env.CLIENT_URL}/</p>
          `,
    };
    sendEmailWithNodemailer(req, res, emailData);
    res.status(200).json({
      success: true,
      message: "Appointment status updated",
    });
  }

  if (status === "cancelled") {
    //  update appointment with status as cancelled
    //  update the availability of the Hub clinician if time and date is still valid
    //  Add a new record in appointment history with status as cancelled
    //  Send email to the patient, Spoke and Hub clinician about the appointment cancellation, and ask to request new appointment

    const {
      appointmentDate,
      appointmentTime,
      requestedTo,
      requestedBy,
      requestedFor,
    } = req.body;

    const updateAppointmentStatus = await appointments
      .findByIdAndUpdate(appointmentId, { status: "cancelled" }, { new: true })
      .populate(appointmentsFilter);

    console.log(updateAppointmentStatus);

    // update the availability of the Hub clinician if time and date is still valid
    // for future date
    if (appointmentDate > today) {
      const clinicianAvailabilityOldSlotUpdate = await Availability.updateOne(
        {
          clinicianId: requestedTo,
          availability: {
            $elemMatch: {
              date: new Date(appointmentDate),
              "slots.time": appointmentTime,
            },
          },
        },
        {
          $set: {
            "availability.$[outer].slots.$[inner].isAvailable": true,
          },
        },
        {
          arrayFilters: [
            {
              "outer.date": new Date(appointmentDate),
            },
            {
              "inner.time": appointmentTime,
            },
          ],
        }
      );
    }
    // current date
    if (appointmentDate === today) {
      if (appointmentTime > currentTime) {
        const clinicianAvailabilityOldSlotUpdate = await Availability.updateOne(
          {
            clinicianId: requestedTo,
            availability: {
              $elemMatch: {
                date: new Date(appointmentDate),
                "slots.time": appointmentTime,
              },
            },
          },
          {
            $set: {
              "availability.$[outer].slots.$[inner].isAvailable": true,
            },
          },
          {
            arrayFilters: [
              {
                "outer.date": new Date(appointmentDate),
              },
              {
                "inner.time": appointmentTime,
              },
            ],
          }
        );
      }
    }

    //  Add a new record in appointment history with status as cancelled
    const updateAppointmentHistory = await appointmentsHistory.create({
      requestedTo: requestedTo,
      requestedBy: requestedBy,
      requestedFor: requestedFor,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      status: "cancelled",
    });

    // send email to patient and Spoke clinician about appointment cancellation
    const emailList = [
      updateAppointmentStatus.requestedBy.email,
      updateAppointmentStatus.requestedFor.email,
    ];

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: emailList,
      subject: `Thank you for choosing PROMOTE. Appointment cancelled`,
      html: `<p>Your appointment :  ${appointmentId} on ${appointmentDate} at ${appointmentTime} has been cancelled. </p>
      <p>This email may contain sensitive information</p>
      </p>${process.env.CLIENT_URL}/</p>
      `,
    };
    sendEmailWithNodemailer(req, res, emailData);
    res.status(200).json({
      success: true,
      message: "Appointment status updated",
    });
  }
});

exports.getConfirmedAppointmentsByDateForClinician = asyncHandler(
  async (req, res, next) => {
    const userId = req.user._id;
    const availabilityDate = req.params.availabilityDate;
    const { role } = await User.findById(req.user._id);
    let query;
    if (role === "hub") {
      query = {
        requestedTo: userId,
        appointmentDate: new Date(availabilityDate),
        status: { $in: ["active", "fulfilled"] },
      };
    }
    if (role === "spoke") {
      query = {
        requestedBy: userId,
        appointmentDate: new Date(availabilityDate),
        status: { $in: ["active", "fulfilled"] },
      };
    }
    const confirmedAppointments = await appointments.find(query);
    if (!confirmedAppointments) {
      return next(
        new ErrorResponse(
          `No confirmed appointments found on ${availabilityDate}`,
          404
        )
      );
    }
    res.status(200).json({
      success: true,
      count: confirmedAppointments.length,
      confirmedAppointments: confirmedAppointments,
    });
  }
);

// cron job to update the pending requests of the previous day to rejected
const updatePendingRequestsToRejected = asyncHandler(async () => {
  const pendingRequests = await requestedAppointment.find({
    status: "pending",
  });
  if (pendingRequests) {
    // rejecting the pending requests
    pendingRequests.forEach((pendingRequest) => {
      const appointmentDate = new Date(pendingRequest.appointmentDate);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      if (appointmentDate < currentDate) {
        requestedAppointment
          .findByIdAndUpdate(pendingRequest._id, {
            status: "rejected",
          })
          .then((updatedRequest) => {
            console.log(updatedRequest);
          })
          .catch((err) => {
            console.log(err);
          });

        // send an email about the expired pending request and ask them to requests again
        // pending work
      }
    });
  } else {
    console.log("No pending requests found");
  }
});
cron.schedule("* */30 * * * *", updatePendingRequestsToRejected);
// cron.schedule("* 0 0 * * *", updatePendingRequestsToRejected); --> to run at midnight

// update the Hub clinician availability for every 30 min as slot gets expired

// 1) update the expired time slots to false
// 2) reject the pending requests present for this slot and send an email to rebook again
const updateHubClinicianAvailability = asyncHandler(async () => {
  var today = new Date();
  let minutes = today.getMinutes();
  let hours = today.getHours();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  today = mm + "/" + dd + "/" + yyyy;
  minutes = minutes <= 9 ? "0" + minutes : minutes;
  hours = hours <= 9 ? "0" + hours : hours;

  var currentTime = hours + ":" + minutes;

  // get all hub clinicians
  const getAllHubClinicians = await User.find({
    role: "hub",
  }).select("_id");

  if (getAllHubClinicians) {
    getAllHubClinicians.forEach(async (hubClinician) => {
      const getClinicianAvailability = await Availability.aggregate([
        {
          $match: {
            clinicianId: hubClinician._id,
          },
        },
        { $unwind: "$availability" },
        {
          $match: {
            "availability.date": new Date(today),
          },
        },
      ]);

      if (getClinicianAvailability[0].availability.slots.length > 0) {
        getClinicianAvailability[0].availability.slots.forEach(async (slot) => {
          console.log(
            "slot time",
            slot.time,
            "current time",
            currentTime,
            slot.time < currentTime
          );
          if (slot.time <= currentTime) {
            const clinicianAvailabilitySlotUpdate =
              await Availability.updateOne(
                {
                  clinicianId: hubClinician._id,
                  availability: {
                    $elemMatch: {
                      date: new Date(today),
                      "slots.time": slot.time,
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
                      "outer.date": new Date(today),
                    },
                    {
                      "inner.time": slot.time,
                    },
                  ],
                }
              );
          }
        });
      }
    });
  }
});
cron.schedule("1 */30 * * * *", updateHubClinicianAvailability);

// run a cron job every 20 min and 30 min of the hour to send email to clinicians as a reminder about the appointment

// * 20,50 * * * *
