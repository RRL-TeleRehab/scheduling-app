const express = require("express");
const router = express.Router();

//import controllers
const {
  signin,
  signup,
  accountActivation,
  forgotPassword,
  resetPassword,
  googleLogin,
} = require("../controllers/auth");

//import validators
const {
  userSignupValidator,
  userSignInValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/auth");
const { runValidation } = require("../validators/index");

// user sign in, sign up and account activation routes

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/signin", userSignInValidator, runValidation, signin);
router.post("/account-activation", accountActivation);

// forgot reset password routes
router.put(
  "/forgot-password",
  forgotPasswordValidator,
  runValidation,
  forgotPassword
);
router.put(
  "/reset-password",
  resetPasswordValidator,
  runValidation,
  resetPassword
);

// google and facebook login
router.post("/google-login", googleLogin);

module.exports = router;
