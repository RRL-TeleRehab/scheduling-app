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
    username: {
      type: String,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      default: "Dr",
      enum: ["Dr", "Mr", "Mrs", "Ms", "Miss", "Mx", "Rev", "Sir"],
    },
    clinicContact: {
      type: String,
      trim: true,
      default: "",
    },
    aboutClinician: {
      type: String,
      trim: true,
      max: 300,
      default: "",
    },
    profilePhoto: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/promote-b3a12.appspot.com/o/userAvatar%2Fperson_FILL0_wght400_GRAD0_opsz48.svg?alt=media&token=e4a21d08-566d-4a00-8b9e-b0a701e4c1c2",
      trim: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
    },
    dateOfBirth: {
      type: String,
      default: "",
    },
    // format MM-DD-YYYY
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      default: "",
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
    clinicName: {
      type: String,
      default: "",
    },
    clinicAddress: {
      address1: { type: String, default: "" },
      address2: { type: String, default: "" },
      city: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      province: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    clinicianSpecialization: [{ type: String }],
    clinicRegisteredYear: {
      type: String,
      default: "",
    },
    clinicRegistrationNo: {
      type: Number,
      default: 0,
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
