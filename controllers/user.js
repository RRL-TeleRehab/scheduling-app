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
    user.resetPasswordLink = undefined;
    if (user.role !== "hub") {
      user.meetingLink = undefined;
    }
    return res.json(user);
  });
};

exports.update = (req, res, next) => {
  const {
    firstName,
    lastName,
    newPassword,
    confirmNewPassword,
    title,
    profilePhoto,
    aboutClinician,
    clinicContact,
    dateOfBirth,
    yearsOfExperience,
    gender,
    clinicName,
    clinicRegisteredYear,
    clinicRegistrationNo,
    clinicianTrainedLocation,
    clinicianProfessionalCourses,
    clinicianSpecialization,
    clinicAddress,
    affiliatedFrom,
    meetingLink,
    socialMediaHandles,
  } = req.body;
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

    if (newPassword || confirmNewPassword) {
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
          error: "Passwords do not match",
        });
      } else {
        user.password = newPassword;
      }
    }

    if (aboutClinician) {
      user.aboutClinician = aboutClinician;
    }
    if (affiliatedFrom) {
      user.affiliatedFrom = affiliatedFrom;
    }
    if (title) {
      user.title = title;
    }
    if (profilePhoto) {
      user.profilePhoto = profilePhoto;
    }

    if (dateOfBirth) {
      user.dateOfBirth = dateOfBirth;
    }
    if (yearsOfExperience) {
      user.yearsOfExperience = yearsOfExperience;
    }
    if (gender) {
      user.gender = gender;
    }
    if (clinicName) {
      user.clinicName = clinicName;
    }
    if (clinicRegisteredYear) {
      user.clinicRegisteredYear = clinicRegisteredYear;
    }
    if (clinicRegistrationNo) {
      user.clinicRegistrationNo = clinicRegistrationNo;
    }
    if (clinicianTrainedLocation) {
      user.clinicianTrainedLocation = clinicianTrainedLocation;
    }
    if (clinicAddress) {
      user.clinicAddress = clinicAddress;
    }
    if (clinicContact) {
      user.clinicContact = clinicContact;
    }
    if (meetingLink) {
      user.meetingLink = meetingLink;
    }
    if (socialMediaHandles) {
      user.socialMediaHandles = socialMediaHandles;
    }
    if (clinicianProfessionalCourses) {
      user.clinicianProfessionalCourses = clinicianProfessionalCourses;
    }
    if (clinicianSpecialization) {
      user.clinicianSpecialization = clinicianSpecialization;
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
      user.resetPasswordLink = undefined;
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
