const Availability = require("../models/availability");
const User = require("../models/user");
const asyncHandler = require("../helpers/async");
const { update } = require("../models/availability");

// @description :  Create and update availability for Hub Clinician
// @route POST /api/availability
// @access Hub Clinician

exports.createAvailability = asyncHandler(async (req, res, next) => {
  const { clinicianId, availability } = req.body;
  const { date, slots } = availability[0];
  console.log(slots);

  try {
    const clinicianExists = await Availability.findOne({
      clinicianId: clinicianId,
    });
    // when no clinician Availability exists create the availability
    if (!clinicianExists) {
      const newAvailability = await Availability.create(req.body);
      return res.status(200).json({
        message: "Availability created successfully",
        data: newAvailability,
      });
    }

    const checkDate = await Availability.findOne({
      clinicianId: clinicianId,
      "availability.date": new Date(availability[0].date),
    });

    let clinicianAvailability;
    if (!checkDate) {
      clinicianAvailability = await Availability.updateOne(
        {
          clinicianId: clinicianId,
        },
        { $push: { availability: availability[0] } }
      );
    } else {
      clinicianAvailability = await Availability.updateOne(
        {
          clinicianId: clinicianId,
          "availability.date": new Date(availability[0].date),
        },
        { $set: { "availability.$.slots": availability[0].slots } }
      );
    }

    return res
      .status(200)
      .json({ message: " Availability Updated", data: clinicianAvailability });
  } catch (err) {
    console.log(err);
  }
});

// @description :  Get availability for a single Hub Clinician
// @route GET /api/availability/:clinicianId
// @access Public (Requires SignIn)

exports.getClinicianAvailability = (req, res, next) => {
  const clinicianId = req.params.clinicianId;
  Availability.findOne({ clinicianId: clinicianId })
    .populate("clinicianId", "") // populating response with hub clinician data
    .exec((err, clinicianAvailability) => {
      if (err || !clinicianAvailability) {
        return res
          .status(400)
          .json({ message: "Clinician availability not found" });
      }
      return res.status(200).json(clinicianAvailability);
    });
};

// Create a PUT API call only to update the availability of a clinician for a specific date or can use the POST method to update the availability

// Create an DELETE API call only to delete the availability of the clinician for the complete date
