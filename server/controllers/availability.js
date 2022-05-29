const Availability = require("../models/availability");
const User = require("../models/user");

// @description :  Create a new Availability for Hub Clinician
// @route POST /api/availability
// @access Hub Clinician

exports.create = (req, res, next) => {
  const { clinicianId, availability } = req.body;
  Availability.findOne({
    clinicianId: clinicianId,
  }).exec((err, clinicianAvailability) => {
    // check if availability has been already provided or not. If not, create a new availability otherwise update availability
    if (err) {
      return res.status(400).json({
        error: "Error finding clinician availability",
      });
    }
    // If availability has been already provided earlier then update availability
    if (clinicianAvailability) {
      return res.json("Availability updated successfully");
    } else {
      // create a new Availability for the clinician if no records of availability found
      const newAvailability = new Availability({
        clinicianId: clinicianId,
        availability: availability,
      });
      newAvailability.save((err, data) => {
        if (err) {
          return res.status(400).json({
            message: "Unable to add availability",
          });
        }
        return res.json({
          message: "Availability added successfully",
        });
      });
    }
  });
};

// @description :  Get availability for Hub Clinician
// @route GET /api/availability
// @access Public (Requires SignIn)
