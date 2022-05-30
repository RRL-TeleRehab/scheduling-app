import React, { Fragment, useState } from "react";

const Slots = ({ timeSlots, selectedSlotsList }) => {
  const generatedSlots = timeSlots;

  const [selectedSlots, setSelectedSlots] = useState([]);

  console.log("Data in Slots component", selectedSlots);

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
    selectedSlotsList(selectedCheckboxList);
  };
  return (
    <div>
      {generatedSlots.map((slot, index) => (
        <Fragment key={index}>
          <input
            type="checkbox"
            onChange={handleCheckBoxChange}
            value={slot}
          ></input>
          <span>{slot}</span>
        </Fragment>
      ))}
    </div>
  );
};

export default Slots;
