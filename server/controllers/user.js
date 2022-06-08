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
    if (firstName) {
      user.firstName = firstName;
    }
    if (lastName) {
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

exports.getHubClinicians = (req, res, next) => {
  User.find({ role: "hub" })
    .sort({ lastName: 1, firstName: 1 })
    .exec((err, users) => {
      if (err || !users) {
        return res.status(400).json({ message: "No clinicians found" });
      }
      return res.status(200).json(users);
    });
};
