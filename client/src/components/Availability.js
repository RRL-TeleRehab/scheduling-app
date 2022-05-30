import React, { useState } from "react";
import SideBarView from "./SideBarView";
import NavBar from "./NavBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Slots from "./Slots";
import { getCookie, isAuth } from "../auth/helpers.js";
import axios from "axios";

const Availability = () => {
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [clinicOpenTime, setClinicOpenTime] = useState();
  const [clinicCloseTime, setClinicCloseTime] = useState();

  // State used to store generated slots from Clinic Opening Time and Closing Time
  const [generatedSlots, setGeneratedSlots] = useState([]);

  // Slots that have been selected by the clinican stating available - to be stored in the database
  const [selectedSlotsData, setSelectedSlotsData] = useState([]);

  const token = getCookie("token");

  // Data from the child component 'Slots'
  const selectedSlotsList = (data) => {
    setSelectedSlotsData(data);
  };
  // console.log("Data from Slots component", selectedSlotsData);

  // Function to convert the default time to Date format
  const convertToDate = (str) => {
    var date = new Date(str);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    return [month, day, date.getFullYear()].join("-");
  };

  // Function to convert the default format of current time to HH:MM format
  const convertToTime = (str) => {
    var date = new Date(str);
    var hours = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);
    return [hours, minutes].join(":");
  };

  console.log(convertToDate(appointmentDate));
  console.log(convertToTime(clinicOpenTime));
  console.log(convertToTime(clinicCloseTime));
  console.log("generatedSlots", generatedSlots);

  function generateTimeslots(timeInterval, startTime, endTime) {
    // get the total minutes between the start and end times.
    var totalMins = subtractTimes(startTime, endTime);

    // set the initial timeSlots array to just the start time
    var timeSlots = [startTime];

    // get the rest of the time slots.
    return getTimeSlots(timeInterval, totalMins, timeSlots);
  }
  function getTimeSlots(timeInterval, totalMins, timeSlots) {
    // base case - there are still more minutes
    if (totalMins - timeInterval >= 0) {
      // get the previous time slot to add interval to
      var prevTimeSlot = timeSlots[timeSlots.length - 1];
      // add timeInterval to previousTimeSlot to get nextTimeSlot
      var nextTimeSlot = addMinsToTime(timeInterval, prevTimeSlot);
      timeSlots.push(nextTimeSlot);

      // update totalMins
      totalMins -= timeInterval;

      // get next time slot
      return getTimeSlots(timeInterval, totalMins, timeSlots);
    } else {
      // all done!
      setGeneratedSlots(timeSlots);
      return timeSlots;
    }
  }
  function subtractTimes(t2, t1) {
    // get each time's hour and min values
    var [t1Hrs, t1Mins] = getHoursAndMinsFromTime(t1);
    var [t2Hrs, t2Mins] = getHoursAndMinsFromTime(t2);

    // time arithmetic (subtraction)
    if (t1Mins < t2Mins) {
      t1Hrs--;
      t1Mins += 60;
    }
    var mins = t1Mins - t2Mins;
    var hrs = t1Hrs - t2Hrs;

    // this handles scenarios where the startTime > endTime
    if (hrs < 0) {
      hrs += 24;
    }

    return hrs * 60 + mins;
  }

  /**
   * Gets the hours and minutes as intergers from a time string
   *
   * @param  {string} time    a time string: "12:15"
   * @return {array}          [12, 15]
   */
  function getHoursAndMinsFromTime(time) {
    return time.split(":").map(function (str) {
      return parseInt(str);
    });
  }

  /**
   * Adds minutes to a time slot.
   *
   * @param  {interger} mins      number of mintues: 15
   * @param  {string}   time      a time slot: "12:15"
   * @return {string}             a time slot: "12:30"
   */
  function addMinsToTime(mins, time) {
    // get the times hour and min value
    var [timeHrs, timeMins] = getHoursAndMinsFromTime(time);

    // time arithmetic (addition)
    if (timeMins + mins >= 60) {
      var addedHrs = parseInt((timeMins + mins) / 60);
      timeMins = (timeMins + mins) % 60;
      if (timeHrs + addedHrs > 23) {
        timeHrs = (timeHrs + addedHrs) % 24;
      } else {
        timeHrs += addedHrs;
      }
    } else {
      timeMins += mins;
    }

    // make sure the time slots are padded correctly
    return (
      String("00" + timeHrs).slice(-2) + ":" + String("00" + timeMins).slice(-2)
    );
  }

  // API to create availability in backend

  const onAvailabilitySubmit = (event) => {
    event.preventDefault();

    const clinicianId = isAuth()._id;
    const availability = [
      {
        date: convertToDate(appointmentDate),
        slots: selectedSlotsData,
      },
    ];

    console.log(availability);
    console.log(typeof selectedSlotsData);

    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}/availability`,
      headers: { Authorization: `Bearer ${token}` },
      data: { clinicianId, availability },
    })
      .then((response) => {
        console.log("Created Stories", response);
      })
      .catch((error) => {
        console.log("Stories ERROR", error);
      });
  };

  return (
    <div id="wrapper" className="toggled">
      <SideBarView selected="/" />
      <div id="page-content-wrapper " className="">
        <NavBar />
        <div className="container-fluid ">
          <h1>Availability</h1>
          <DatePicker
            selected={appointmentDate}
            onChange={(date) => setAppointmentDate(date)}
          />
          <h6>Clinic Open time</h6>
          <DatePicker
            selected={clinicOpenTime}
            onChange={(date) => setClinicOpenTime(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={30}
            dateFormat="HH:mm"
          />
          <h6> Clinic Closing time</h6>
          <DatePicker
            selected={clinicCloseTime}
            onChange={(date) => setClinicCloseTime(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={30}
            dateFormat="HH:mm"
          />
          <span
            className="btn btn-secondary mt-4"
            onClick={() => {
              generateTimeslots(
                30,
                convertToTime(clinicOpenTime),
                convertToTime(clinicCloseTime)
              );
            }}
          >
            Generate Slots
          </span>
          <Slots
            selectedSlotsList={selectedSlotsList}
            timeSlots={generatedSlots}
          ></Slots>
          <button
            className="btn btn-primary mt-4"
            onClick={onAvailabilitySubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Availability;
