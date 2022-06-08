// User Schema
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      min: 1,
      max: 32,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      min: 1,
      max: 32,
      lowercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
