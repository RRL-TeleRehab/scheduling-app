// User Schema
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    avatar: {
      type: String,
      required: false,
    },
    social: {
      facebook: {
        type: String,
        required: false,
      },
      twitter: {
        type: String,
        required: false,
      },
      linkedin: {
        type: String,
        required: false,
      },
      instagram: {
        type: String,
        required: false,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
