const { check } = require("express-validator");

exports.storyValidator = [
  check("storyTitle").not().isEmpty().withMessage("Title is required"),
  check("storyHeading").not().isEmpty().withMessage("Heading is required"),
  check("storyContent").not().isEmpty().withMessage("Description is required"),
];
