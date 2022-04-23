const { check } = require("express-validator");

exports.userSignupValidator = [
  check("firstName")
    .not()
    .isEmpty()
    .withMessage("Name is required")
    .isAlpha()
    .withMessage("Name must not contains numbers"),
  check("lastName")
    .not()
    .isEmpty()
    .withMessage("Name is required")
    .isAlpha()
    .withMessage("Name must not contains numbers"),

  check("email").not().isEmpty().isEmail().withMessage("Email is required"),

  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isLength({
      min: 8,
    })
    .withMessage("Password must be at least 6 characters")
    .isLength({
      max: 20,
    })
    .withMessage("Password can contain max 20 characters")
    .not()
    .isLowercase()
    .withMessage("Password must contain at least one lowercase letter")
    .not()
    .isUppercase()
    .withMessage("Password must contain at least one uppercase letter")
    .not()
    .isNumeric()
    .withMessage("Password must contain at least one number")
    .not()
    .isAlpha()
    .withMessage("Password must contain at least one special character"),

  check("confirmPassword")
    .not()
    .isEmpty()
    .withMessage("Confirm Password is required")
    .isLength({
      min: 8,
    })
    .withMessage("Password must be at least 6 characters")
    .isLength({
      max: 20,
    })
    .withMessage("Password can contain max 20 characters")
    .not()
    .isLowercase()
    .withMessage("Password must contain at least one lowercase letter")
    .not()
    .isUppercase()
    .withMessage("Password must contain at least one uppercase letter")
    .not()
    .isNumeric()
    .withMessage("Password must contain at least one number")
    .not()
    .isAlpha()
    .withMessage("Password must contain at least one special character"),
  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords don't match");
    }
    return true;
  }),
];

exports.userSignInValidator = [
  check("email").not().isEmpty().isEmail().withMessage("Email is required"),
  check("password").not().isEmpty().withMessage("Password is required"),
];

exports.userUpdateValidator = [
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isLength({
      min: 8,
    })
    .withMessage("Password must be at least 6 characters")
    .isLength({
      max: 20,
    })
    .withMessage("Password can contain max 20 characters")
    .not()
    .isLowercase()
    .withMessage("Password must contain at least one lowercase letter")
    .not()
    .isUppercase()
    .withMessage("Password must contain at least one uppercase letter")
    .not()
    .isNumeric()
    .withMessage("Password must contain at least one number")
    .not()
    .isAlpha()
    .withMessage("Password must contain at least one special character"),

  check("confirmPassword")
    .not()
    .isEmpty()
    .withMessage("Confirm Password is required")
    .isLength({
      min: 8,
    })
    .withMessage("Password must be at least 6 characters")
    .isLength({
      max: 20,
    })
    .withMessage("Password can contain max 20 characters")
    .not()
    .isLowercase()
    .withMessage("Password must contain at least one lowercase letter")
    .not()
    .isUppercase()
    .withMessage("Password must contain at least one uppercase letter")
    .not()
    .isNumeric()
    .withMessage("Password must contain at least one number")
    .not()
    .isAlpha()
    .withMessage("Password must contain at least one special character"),

  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords don't match");
    }
    return true;
  }),
];
