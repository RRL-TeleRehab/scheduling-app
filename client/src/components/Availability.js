import React, { useState, Fragment } from "react";
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

  // Slots that have been selected by the clinician stating available - to be stored in the database
  const [selectedSlots, setSelectedSlots] = useState([]);
  const token = getCookie("token");

  // Function to convert the default time to Date format
  const convertToDate = (str) => {
    var date = new Date(str);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    return [month, day, date.getFullYear()].join("-");
  };

  console.log(convertToDate(appointmentDate));

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

  const handleCheckBoxChange = (event) => {
    var selectedCheckboxList = [...selectedSlots];
    if (event.target.checked) {
      selectedCheckboxList = [
        ...selectedSlots,
        { isAvailable: true, time: event.target.value },
      ];
    } else {
      selectedCheckboxList.splice(selectedSlots.indexOf(event.target.value), 1);
    }
    setSelectedSlots(selectedCheckboxList);
  };

  console.log(selectedSlots);

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

    console.log(availability);
    console.log(typeof selectedSlots);

    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}/availability`,
      headers: { Authorization: `Bearer ${token}` },
      data: { clinicianId, availability },
    })
      .then((response) => {
        console.log("created availability", response);
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
          <div class="row">
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
