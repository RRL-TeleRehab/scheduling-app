const express = require("express");
const router = express.Router();

//import controllers
const { create } = require("../controllers/availability");

// middleware
const {
  requireSignIn,
  hubClinicianMiddleware,
} = require("../controllers/auth");

// validators
router.post("/availability", requireSignIn, hubClinicianMiddleware, create);

module.exports = router;
