const express = require("express");
const router = express.Router();

//import controllers
const { read, update } = require("../controllers/user");
const { requireSignIn, adminMiddleware } = require("../controllers/auth");

const { updateUserValidator } = require("../validators/auth");

// Run validations
const { runValidation } = require("../validators/index");

router.get("/user/:id", requireSignIn, read);
router.put(
  "/user/update",
  requireSignIn,
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
