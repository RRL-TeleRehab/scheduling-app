const express = require("express");
const router = express.Router();

//import controllers
const { signin, signup, accountActivation } = require("../controllers/auth");

//import validators
const {
  userSignupValidator,
  userSignInValidator,
} = require("../validators/auth");
const { runValidation } = require("../validators/index");

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/signin", userSignInValidator, runValidation, signin);
router.post("/account-activation", accountActivation);

module.exports = router;
