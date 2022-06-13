const Availability = require("../models/availability");
const User = require("../models/user");
const asyncHandler = require("../helpers/async");
var ObjectId = require("mongodb").ObjectID;

// @description :  Create a new Availability for Hub Clinician
// @route POST /api/availability
// @access Hub Clinician

// exports.createAvailability = (req, res, next) => {
//   const { clinicianId, availability } = req.body;
//   console.log(availability[0].date);

//   Availability.findOne({
//     clinicianId: clinicianId,
//   }).exec((err, clinicianExists) => {
//     // check if availability has been already provided or not by the hub clinician. If not, create a new availability otherwise update availability
//     if (err) {
//       return res.status(400).json({
//         error: "Error finding clinician availability",
//       });
//     }
//     // If availability has been already provided earlier for a particular date, if yes, update availability
//     if (clinicianExists) {
//       Availability.findOneAndUpdate(
//         { clinicianId: clinicianId },
//         {
//           $set: {
//             clinicianId: clinicianId,
//             availability: availability,
//           },
//         }
//         // { new: true }
//       ).exec((err, availability) => {
//         if (err || !availability) {
//           return res.status(400).json({
//             error: "Availability not found",
//           });
//         }
//         return res.status(200).json("Availability updated successfully");
//       });
//     } else {
//       // create a new Availability for the clinician if no records of availability found for the specified date
//       const newAvailability = new Availability({
//         clinicianId: clinicianId,
//         availability: availability,
//       });
//       newAvailability.save((err, data) => {
//         if (err) {
//           return res.status(400).json({
//             message: "Unable to add availability",
//           });
//         }
//         return res.json({
//           message: "Availability added successfully",
//         });
//       });
//     }
//   });
// };

exports.createAvailability = asyncHandler(async (req, res, next) => {
  const { clinicianId, availability } = req.body;
  const { date, slots } = availability[0];
  console.log("date and slots information", date, slots);
  const updateDate = new Date(date);
  console.log("Date Object", updateDate);
  console.log("from UI", typeof updateDate);

  try {
    const clinicianExists = await Availability.findOne({
      clinicianId: clinicianId,
    });
    // console.log(clinicianExists);
    if (!clinicianExists) {
      const newAvailability = await Availability.create(req.body);
      return res
        .status(200)
        .json({ message: "Availability created successfully" });
    }

    let availabilityData = clinicianExists.availability;
    // console.log(availabilityData);
    console.log(availabilityData[0].date);
    console.log("from DB", typeof availabilityData[0].date);

    console.log("both are same?", +updateDate === +availabilityData[0].date);

    // const info = await Availability.find({
    //   "availability.slots.time": "03:00",
    // });
    // console.log(info);

    // Availability.find({
    //   "availability.date": "06-09-2022",
    //   "availability.slots.time": "03:00",
    // }).exec((err, data) => {
    //   if (err) {
    //     console.log(err);
    //   }
    //   console.log(data);
    // });

    // const info1 = await Availability.aggregate([
    //   {
    //     $match: { _id: ObjectId("62a262176e602aa175de1053") },
    //   },
    //   { $unwind: "$availability" },
    //   { $match: { "availability.slots.isAvailable": false } },
    // ]);
    // console.log(info1);

    const info1 = await Availability.aggregate([
      {
        $match: {
          "availability.date": {
            $gte: Date("2022-06-08T04:00:00.000Z"),
            $lt: Date("2022-06-08T04:00:00.000Z"),
          },
        },
      },
      // { $unwind: "$availability" },
      // { $match: { "availability.slots.isAvailable": false } },
    ]);
    console.log(info1);

    // console.log(availabilityData[0]["date"]);

    // console.log(typeof availabilityData[0].date.toISOString());
    // console.log(availabilityData[0].slots.length);
    // console.log(availabilityData[0].slots[0]);
    // console.log(
    //   "statement ran here",
    //   new Date(availability[0].date).toISOString()
    // );
    // console.log("type", typeof new Date(availability[0].date).toISOString());
    return res.status(200).json({ message: " Availability Updated" });
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

// Create a Post API call only to update the availability of a clinician for a specific date or can use the POST method to update the availability

// Create an DELETE API call only to delete the availability of the clinician for the complete date
