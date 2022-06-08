// User Schema
const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
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
    clinicContact: {
      type: Number,
      trim: true,
      default: "",
    },
    aboutClinician: {
      type: String,
      trim: true,
      max: 200,
      default: "",
    },
    profilePhoto: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/promote-b3a12.appspot.com/o/userAvatar%2FdefaultAvatar.svg?alt=media&token=57a9ef20-56c2-488c-9e05-3755f6206ec5",
      trim: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
    },
    role: {
      type: String,
      default: "spoke",
      enum: ["spoke", "hub", "admin"],
    },
    resetPasswordLink: {
      data: String,
      default: "",
    },
    clinicAddress: {
      streetAddress: { type: String, default: "" },
      city: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      province: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    clinicianSpecialization: [{ type: String }],
    clinicRegisteredYear: {
      type: Number,
      default: "",
    },
    clinicRegistrationNo: {
      type: Number,
      default: "",
    },
    clinicianTrainedLocation: {
      type: String,
      default: "",
    },
    clinicianProfessionalCourses: [
      {
        type: String,
      },
    ],
    affiliatedFrom: {
      type: String,
      default: "",
    },
    meetingLink: {
      type: String,
      default: "",
    },
    socialMediaHandles: {
      facebook: {
        type: String,
        required: false,
        default: "",
      },
      twitter: {
        type: String,
        required: false,
        default: "",
      },
      linkedin: {
        type: String,
        required: false,
        default: "",
      },
      instagram: {
        type: String,
        required: false,
        default: "",
      },
    },
  },
  { timestamps: true }
);

// virtual methods
// In the database we save the hashed password so we use virtual method to hash the user password before saving it to the database
userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
    console.log(this.password);
    console.log(this.salt);
    console.log(this.hashed_password);
  })
  .get(function () {
    return this._password;
  });

//methods
userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};

module.exports = mongoose.model("User", userSchema);
