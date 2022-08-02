const Availability = require("../models/availability");
const asyncHandler = require("../helpers/async");
var mongoose = require("mongoose");
const { sendEmailWithNodemailer } = require("../helpers/email");
const {
  requestedAppointment,
  requestedAppointmentHistory,
  appointments,
  appointmentsHistory,
} = require("../models/appointments");
const {
  findByIdAndUpdate,
  findOneAndUpdate,
} = require("../models/availability");

// @description :  Create, update and delete availability for Hub Clinician
// @route POST /api/availability
// @access Hub Clinician

exports.createAvailability = asyncHandler(async (req, res, next) => {
  // Use cases:
  // 1) iF availability is updated or deleted  - if a time slot is updated or deleted an email should be sent to Spoke clinicians and patients
  //  whose have booked an appointment where the appointment is either in pending state or active appointment.

  // 2) Check if there are any confirmed appointments and send email for rescheduling

  const { clinicianId, availability } = req.body;
  try {
    const clinicianExists = await Availability.findOne({
      clinicianId: clinicianId,
    });
    // when no clinician Availability exists create the availability
    if (!clinicianExists) {
      const newAvailability = await Availability.create(req.body);
      return res.status(200).json({
        message: "Availability created successfully",
        data: newAvailability,
      });
    }

    // check if availability for the date is already available or not
    // if slot are already present for a particular date, update the slots otherwise push all the slots
    const checkAvailabilityByDate = await Availability.findOne({
      clinicianId: clinicianId,
      "availability.date": new Date(availability[0].date),
    });

    let clinicianAvailability;
    if (!checkAvailabilityByDate) {
      clinicianAvailability = await Availability.updateOne(
        {
          clinicianId: clinicianId,
        },
        { $push: { availability: availability[0] } }
      );
    } else {
      // Updating the existing slots and send email for the slots that has been removed.

      // check removed slots
      const availableTimeSlotsByDate = await Availability.aggregate([
        {
          $match: {
            clinicianId: mongoose.Types.ObjectId(clinicianId),
          },
        },
        { $unwind: "$availability" },
        {
          $match: {
            "availability.date": new Date(availability[0].date),
          },
        },
      ]);

      if (!availableTimeSlotsByDate) {
        return res
          .status(400)
          .json({ message: "Unable to fetch current availability" });
      }

      let currentAvailableSlots = [];
      availableTimeSlotsByDate[0].availability.slots.map((slot) => {
        currentAvailableSlots.push(slot.time);
      });
      // console.log("old slots available ", currentAvailableSlots);

      let toBeUpdatedSlots = [];
      availability[0].slots.map((slot) => {
        toBeUpdatedSlots.push(slot.time);
      });
      // console.log("toBeUpdatedSlots", toBeUpdatedSlots);

      let removedTimeSlots = currentAvailableSlots.filter(
        (slot) => !toBeUpdatedSlots.includes(slot)
      );
      // console.log("removedTimeSlots", removedTimeSlots);

      // Check pending appointments requested for the removed time slots and update appointment status to rejected or cancelled
      // Add the records to the history of the appointment requested
      if (removedTimeSlots.length > 0) {
        const pendingAppointmentRequests = await requestedAppointment
          .find({
            requestedTo: clinicianId,
            status: { $in: ["pending", "accepted"] },
            appointmentDate: new Date(availability[0].date),
            appointmentTime: { $in: removedTimeSlots },
          })
          .populate([
            {
              path: "requestedBy",
              model: "User",
              select: "firstName lastName email",
            },
            {
              path: "requestedTo",
              model: "User",
              select: "firstName lastName email",
            },
            {
              path: "requestedFor",
              model: "Patient",
              select: "firstName lastName email",
            },
          ]);

        // console.log("pendingAppointmentRequests", pendingAppointmentRequests);

        if (pendingAppointmentRequests.length > 0) {
          // send email to the removed slots pending request Appointments
          try {
            pendingAppointmentRequests.map(async (appointment) => {
              // update old requested Appointment status to rejected

              const updateRequestAppointment =
                await requestedAppointment.updateOne(
                  {
                    requestedTo: clinicianId,
                    status: { $in: ["pending", "accepted"] },
                    appointmentDate: new Date(availability[0].date),
                    appointmentTime: appointment.appointmentTime,
                  },
                  { $set: { status: "rejected" } }
                );

              const updateRequestedAppointmentHistory =
                await requestedAppointmentHistory.create({
                  requestedBy: appointment.requestedBy._id,
                  requestedFor: appointment.requestedFor._id,
                  requestedTo: appointment.requestedTo._id,
                  status: "rejected",
                  appointmentDate: appointment.appointmentDate,
                  appointmentTime: appointment.appointmentTime,
                });

              let rejectEmailData = {
                from: process.env.EMAIL_FROM,
                to: [
                  appointment.requestedBy.email,
                  appointment.requestedFor.email,
                ],
                subject: `Thank you for choosing PROMOTE. Appointment request with ${appointment.requestedTo.firstName} ${appointment.requestedTo.lastName} 
                has been rejected due to unavailability of the clinician. please select the next available time slot.`,
                html: `
                <p> Appointment Request ID:  ${appointment._id}
                on ${appointment.appointmentDate} at ${appointment.appointmentTime}
                has been rejected. Please select next available date </p>
                <p>Patient Details</p>
                <h6>${appointment.requestedFor.firstName}</h6>
                <h6>${appointment.requestedFor.lastName}</h6>
                <h6>${appointment.requestedFor.email}</h6>
                <p>This email may contain sensitive information</p>
                <p>${process.env.CLIENT_URL}/</p>
                `,
              };
              sendEmailWithNodemailer(req, res, rejectEmailData);
            });
          } catch (err) {
            console.log(err);
            return res
              .status(400)
              .json({ message: "Error updating availability" });
          }
        }

        // Check confirmed active appointments for the removed time slots and update appointment status cancelled
        // Add the records to the history of the appointment confirmed
        const activeAppointmentBookings = await appointments
          .find({
            requestedTo: clinicianId,
            status: "active",
            appointmentDate: new Date(availability[0].date),
            appointmentTime: { $in: removedTimeSlots },
          })
          .populate([
            {
              path: "requestedBy",
              model: "User",
              select: "firstName lastName email",
            },
            {
              path: "requestedTo",
              model: "User",
              select: "firstName lastName email",
            },
            {
              path: "requestedFor",
              model: "Patient",
              select: "firstName lastName email",
            },
          ]);

        console.log("activeAppointmentBookings", activeAppointmentBookings);

        if (activeAppointmentBookings.length > 0) {
          try {
            activeAppointmentBookings.map(async (appointment) => {
              //delete appointment Information from the appointment collection
              const removeActiveAppointment = await appointments.deleteOne({
                requestedTo: appointment.requestedTo,
                status: "active",
                appointmentDate: new Date(availability[0].date),
                appointmentTime: appointment.appointmentTime,
              });
              // create a new record in appointmentsHistory with status cancelled
              const createAppointmentHistory = await appointmentsHistory.create(
                {
                  requestedBy: appointment.requestedBy._id,
                  requestedFor: appointment.requestedFor._id,
                  requestedTo: appointment.requestedTo._id,
                  status: "cancelled",
                  appointmentDate: appointment.appointmentDate,
                  appointmentTime: appointment.appointmentTime,
                }
              );

              const cancelledEmailData = {
                from: process.env.EMAIL_FROM,
                to: [
                  appointment.requestedBy.email,
                  appointment.requestedFor.email,
                ],
                subject: `Thank you for choosing PROMOTE. Appointment with ${appointment.requestedTo.firstName} ${appointment.requestedTo.lastName} has been 
                      cancelled due to the clinician availability`,
                html: `
                <p> Appointment Confirmation ID:  ${appointment._id}
                on ${appointment.appointmentDate} at ${appointment.appointmentTime}
                has been Cancelled. Please select next available date </p>
                <p>Patient Details</p>
                <h6>${appointment.requestedFor.firstName}</h6>
                <h6>${appointment.requestedFor.lastName}</h6>
                <h6>${appointment.requestedFor.email}</h6>
                <p>This email may contain sensitive information</p>
                <p>${process.env.CLIENT_URL}/</p>
                `,
              };
              sendEmailWithNodemailer(req, res, cancelledEmailData);
            });
          } catch (error) {
            console.log("error", error);
            return res
              .status(400)
              .json({ message: "Error cancelling appointments" });
          }
        }
      }

      clinicianAvailability = await Availability.updateOne(
        {
          clinicianId: clinicianId,
          "availability.date": new Date(availability[0].date),
        },
        { $set: { "availability.$.slots": availability[0].slots } }
      );
    }

    return res
      .status(200)
      .json({ message: " Availability Updated", data: clinicianAvailability });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error updating availability" });
  }
});

// @description :  Get availability for a single Hub Clinician for a particular date
// @route GET /api/availability/:clinicianId
// @access Public (Requires SignIn)

exports.getClinicianAvailability = asyncHandler(async (req, res, next) => {
  const clinicianId = req.params.clinicianId;
  const availabilityDate = req.params.availabilityDate;
  const availabilitySlots = await Availability.aggregate([
    {
      $match: {
        clinicianId: mongoose.Types.ObjectId(clinicianId),
      },
    },
    { $unwind: "$availability" },
    {
      $match: {
        "availability.date": new Date(availabilityDate),
      },
    },
  ]);

  return res.status(200).json({ availableSlots: availabilitySlots });
});
