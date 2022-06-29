import React, { useState, useEffect } from "react";
import SideBarView from "./SideBarView";
import NavBar from "./NavBar";
import { getCookie, isAuth } from "../auth/helpers.js";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import moment from "moment";
import "./Availability.css";

const Availability = () => {
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Slots that have been selected by the clinician stating available - to be stored in the database
  const [selectedSlots, setSelectedSlots] = useState([]);
  const token = getCookie("token");

  let timeSlotsAvailabilityFromDBByDate = [];
  let timeSlotsFromDB = [];

  // get Todays Data and update UI
  const [availabilityByDate, setAvailabilityByDate] = useState([]);

  // Function to convert the default time to Date format
  const convertToDate = (str) => {
    var date = new Date(str);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    return [month, day, date.getFullYear()].join("-");
  };

  console.log("today value", availabilityByDate);

  // get Current date available time slots from the database
  const getAvailabilityByDate = () => {
    const clinicianId = isAuth()._id;
    const availabilityDate = convertToDate(appointmentDate);
    axios({
      method: "GET",
      url: `${process.env.REACT_APP_API}/availability/${clinicianId}/${availabilityDate}`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        setAvailabilityByDate(
          response.data.availableSlots[0].availability.slots
        );
        timeSlotsAvailabilityFromDBByDate.length = 0;
        availabilityByDate.map(async (slot) => {
          timeSlotsAvailabilityFromDBByDate.push({
            time: slot.time,
            isAvailable: slot.isAvailable,
          });
        });
        setSelectedSlots(timeSlotsAvailabilityFromDBByDate);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Availability ERROR", error);
      });
  };

  useEffect(() => {
    getAvailabilityByDate();
  }, [appointmentDate]);

  // useEffect(() => {
  //   timeSlotsAvailabilityFromDBByDate.length = 0;
  //   timeSlotsFromDB.length = 0;
  //   availabilityByDate.map(async (slot) => {
  //     timeSlotsAvailabilityFromDBByDate.push({
  //       time: slot.time,
  //       isAvailable: slot.isAvailable,
  //     });
  //     timeSlotsFromDB.push(slot.time);
  //   });
  //   setSelectedSlots(timeSlotsAvailabilityFromDBByDate);
  //   console.log(
  //     "default slots from db",
  //     timeSlotsAvailabilityFromDBByDate,
  //     timeSlotsFromDB
  //   );
  // }, [availabilityByDate, appointmentDate]);

  // generate the default slots for the day starting at 12:00AM to 12:00PM
  let generateTimeSlots = {
    slotInterval: 30,
    clinicOpenTime: "00:00",
    clinicCloseTime: "24:00",
  };
  //Format the time
  let startTime = moment(generateTimeSlots.clinicOpenTime, "HH:mm");

  //Format the end time with time frame not moving to next day
  let endTime = moment(generateTimeSlots.clinicCloseTime, "HH:mm").add(
    0,
    "days"
  );
  let generatedTimeSlots = [];
  while (startTime < endTime) {
    //Push times
    generatedTimeSlots.push(startTime.format("HH:mm"));
    //Add interval of 30 minutes
    startTime.add(generateTimeSlots.slotInterval, "minutes");
  }

  // console.log("generated time slots", generatedTimeSlots);
  const handleCheckBoxChange = (event) => {
    var selectedCheckboxList = [...selectedSlots];
    if (event.target.checked) {
      selectedCheckboxList = [
        ...selectedSlots,
        { time: event.target.value, isAvailable: true },
      ];
    } else {
      selectedCheckboxList.splice(selectedSlots.indexOf(event.target.value), 1);
    }
    setSelectedSlots(selectedCheckboxList);
  };

  console.log("Slots selected from UI", selectedSlots);

  // API to create availability in backend
  const updateAvailability = (event) => {
    event.preventDefault();

    const clinicianId = isAuth()._id;
    const availability = [
      {
        date: convertToDate(appointmentDate),
        slots: selectedSlots,
      },
    ];

    // console.log(availability);
    // console.log(typeof selectedSlots);

    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}/availability`,
      headers: { Authorization: `Bearer ${token}` },
      data: { clinicianId, availability },
    })
      .then((response) => {
        console.log("created availability", response);
        getAvailabilityByDate();
      })
      .catch((error) => {
        console.log("Availability ERROR", error);
      });
  };

  return (
    <div id="wrapper" className="toggled">
      <SideBarView selected="/" />
      <div id="page-content-wrapper " className="">
        <NavBar />
        <div className="container-fluid ">
          <div className="row">
            <div className="col-md-4 offset-2">
              <h3>Add your availability</h3>
              <Calendar
                onChange={(date) => {
                  setAppointmentDate(date);
                  setSelectedSlots([]);
                }}
              />
            </div>
            <div className="col-md-4">
              <div className="row ">
                {generatedTimeSlots.map((slot, index) => (
                  <div className="col-3 mt-2" key={index}>
                    <div className="time-slot">
                      <label>
                        <input
                          type="checkbox"
                          value={slot}
                          onChange={handleCheckBoxChange}
                          defaultChecked={
                            timeSlotsFromDB.includes(slot) ? true : false
                          }
                        ></input>
                        <span>{slot}</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-primary mt-4"
                onClick={updateAvailability}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
