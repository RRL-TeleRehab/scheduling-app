const express = require("express");
const router = express.Router();

//import controllers
const {
  getAllStories,
  createStory,
  getStory,
  updateStory,
  deleteStory,
} = require("../controllers/story");
const { requireSignIn, adminMiddleware } = require("../controllers/auth");

// validators
const { storyValidator } = require("../validators/story");
const { runValidation } = require("../validators/index");

router.get("/story", getAllStories);
router.get("/story/:storyId", getStory);
router.post(
  "/admin/story",
  requireSignIn,
  adminMiddleware,
  storyValidator,
  runValidation,
  createStory
);
router.put(
  "/admin/story/:storyId",
  requireSignIn,
  adminMiddleware,
  updateStory
);
router.delete(
  "/admin/story/:storyId",
  requireSignIn,
  adminMiddleware,
  deleteStory
);

module.exports = router;
