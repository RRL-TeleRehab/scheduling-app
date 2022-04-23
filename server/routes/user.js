const express = require("express");
const router = express.Router();

//import controllers
const { read, update } = require("../controllers/user");
const { requireSignIn } = require("../controllers/auth");

const { userUpdateValidator } = require("../validators/auth");

// Run validations
const { runValidation } = require("../validators/index");

router.get("/user/:id", requireSignIn, read);
router.put(
  "/user/update",
  requireSignIn,
  userUpdateValidator,
  runValidation,
  update
);

module.exports = router;
