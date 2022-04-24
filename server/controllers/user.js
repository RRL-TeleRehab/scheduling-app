const User = require("../models/user");

exports.read = (req, res, next) => {
  const userId = req.params.id;
  User.findById(userId).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    return res.json(user);
  });
};

exports.update = (req, res, next) => {
  const { firstName, lastName, password, confirmPassword } = req.body;
  const userId = req.user._id;
  User.findById(userId).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    if (!firstName) {
      return res.status(400).json({
        error: "First name is required",
      });
    } else {
      user.firstName = firstName;
    }
    if (!lastName) {
      return res.status(400).json({
        error: "Last name is required",
      });
    } else {
      user.lastName = lastName;
    }

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        return res.status(400).json({
          error: "Passwords do not match",
        });
      } else {
        user.password = password;
      }
    }

    user.save((err, updatedUser) => {
      if (err) {
        console.log("USER UPDATE ERROR", err);
        return res.status(400).json({
          error: "Failed to update user",
        });
      }
      updatedUser.hashed_password = undefined;
      updatedUser.salt = undefined;
      return res.json(updatedUser);
    });
  });
};
