// User Schema
const mongoose = require("mongoose");

const requestedAppointmentSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    requestedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    requestedFor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: ["pending", "accepted", "rejected"],
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const requestedAppointmentHistorySchema = new mongoose.Schema(
  // this is to store the history of the appointment
  // when appointment is confirmed or rejected it is added as a new document
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    requestedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    requestedFor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: ["pending", "accepted", "rejected"],
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//upcoming active Appointments
const appointmentsSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    requestedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    requestedFor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    status: {
      type: String,
      default: "active",
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
  //  this is to store the confirmed appointments
);

const appointmentsHistorySchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    requestedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    requestedFor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    status: {
      type: String,
      required: true,
      default: "active",
      enum: ["active", "cancelled", "fulfilled", "modified"],
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
  // this is to store the history of the appointments when an change in status occurred. Each entry is stored as a new record
);

const requestedAppointment = mongoose.model(
  "RequestedAppointment",
  requestedAppointmentSchema
);

const requestedAppointmentHistory = mongoose.model(
  "RequestedAppointmentHistory",
  requestedAppointmentHistorySchema
);

const appointments = mongoose.model("Appointments", appointmentsSchema);

const appointmentsHistory = mongoose.model(
  "AppointmentsHistory",
  appointmentsHistorySchema
);

module.exports = {
  requestedAppointment: requestedAppointment,
  requestedAppointmentHistory: requestedAppointmentHistory,
  appointments: appointments,
  appointmentsHistory: appointmentsHistory,
};
