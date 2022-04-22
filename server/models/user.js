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
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      min: 1,
      max: 32,
    },
    mobile: {
      type: String,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
      max: 160,
    },
    photo: {
      data: Buffer,
      contentType: String,
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
      default: "patient",
    },
    resetPasswordLink: {
      data: String,
      default: "",
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

// update user model with Address field
