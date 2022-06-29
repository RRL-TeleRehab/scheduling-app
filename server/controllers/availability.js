const Availability = require("../models/availability");
const asyncHandler = require("../helpers/async");
var mongoose = require("mongoose");

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

// @description :  Get availability for a single Hub Clinician for a particular date
// @route GET /api/availability/:clinicianId
// @access Public (Requires SignIn)

exports.getClinicianAvailability = asyncHandler(async (req, res, next) => {
  const clinicianId = req.params.clinicianId;
  const availabilityDate = req.params.availabilityDate;
  const availabilitySlots = await Availability.aggregate([
    {
      $match: {
        clinicianId: mongoose.Types.ObjectId(clinicianId),
      },
    },
    { $unwind: "$availability" },
    {
      $match: {
        "availability.date": new Date(availabilityDate),
      },
    },
  ]);

  return res.status(200).json({ availableSlots: availabilitySlots });
});
