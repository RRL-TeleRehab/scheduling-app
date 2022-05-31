const Availability = require("../models/availability");
const User = require("../models/user");

// @description :  Create a new Availability for Hub Clinician
// @route POST /api/availability
// @access Hub Clinician

exports.createAvailability = (req, res, next) => {
  const { clinicianId, availability } = req.body;
  console.log(availability[0].date);

  Availability.findOne({
    clinicianId: clinicianId,
  }).exec((err, clinicianExists) => {
    // check if availability has been already provided or not. If not, create a new availability otherwise update availability
    if (err) {
      return res.status(400).json({
        error: "Error finding clinician availability",
      });
    }
    // If availability has been already provided earlier for a particular date, if yes, update availability
    if (clinicianExists) {
      Availability.findOneAndUpdate(
        { clinicianId: clinicianId },
        {
          $set: {
            clinicianId: clinicianId,
            availability: availability,
          },
        }
        // { new: true }
      ).exec((err, availability) => {
        if (err || !availability) {
          return res.status(400).json({
            error: "Availability not found",
          });
        }
        return res.status(200).json("Availability updated successfully");
      });
    } else {
      // create a new Availability for the clinician if no records of availability found for the specified date
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

// @description :  Get availability for a single Hub Clinician
// @route GET /api/availability/:clinicianId
// @access Public (Requires SignIn)

exports.getClinicianAvailability = (req, res, next) => {
  const clinicianId = req.params.clinicianId;
  Availability.findOne({ clinicianId: clinicianId }).exec(
    (err, clinicianAvailability) => {
      if (err || !clinicianAvailability) {
        return res
          .status(400)
          .json({ message: "Clinician availability not found" });
      }
      return res.status(200).json(clinicianAvailability);
    }
  );
  // append clinician info in response
};

// Create a Post API call only to update the availability of a clinician for a specific date
