const express = require("express");
const router = express.Router();

//import controllers
const { read, update, getHubClinicians } = require("../controllers/user");
const {
  requireSignIn,
  adminMiddleware,
  userMiddleware,
} = require("../controllers/auth");

const { updateUserValidator } = require("../validators/auth");

// Run validations
const { runValidation } = require("../validators/index");

router.get("/user/:id", requireSignIn, read);
router.put(
  "/user/update",
  requireSignIn,
  userMiddleware,
  updateUserValidator,
  runValidation,
  update
);

router.put(
  "/admin/update",
  requireSignIn,
  adminMiddleware,
  updateUserValidator,
  runValidation,
  update
);

module.exports = router;

router.get("/clinicians", requireSignIn, userMiddleware, getHubClinicians);
