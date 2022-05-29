const mongoose = require("mongoose");

// Clinician Availability
const availabilitySchema = new mongoose.Schema(
  {
    clinicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    availability: [
      {
        date: { type: Date, required: true },
        slots: [
          {
            time: { type: String, required: true },
            isAvailable: { type: Boolean, default: true },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);
