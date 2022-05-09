// User Schema
const mongoose = require("mongoose");
const crypto = require("crypto");

const requestedAppointmentSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    requestedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    requestedFor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    status: {
      type: String,
      required: true,
      default: "pending", // pending, accepted, rejected
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
      ref: "Users",
    },
    requestedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
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

const appointments = new mongoose.Schema(
  {
    clinicianId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
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
    clinicianId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    status: {
      type: String,
      required: true,
      default: "confirmed", // confirmed or date changed or cancelled
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
  // this is to store the history of the appointments
);
