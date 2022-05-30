import React, { Fragment, useState } from "react";

const Slots = ({ timeSlots }) => {
  const generatedSlots = timeSlots;
  return (
    <div>
      {generatedSlots.map((slot) => (
        <Fragment key={slot}>
          <input type="checkbox" value={slot}></input>
          <span>{slot}</span>
        </Fragment>
      ))}
    </div>
  );
};

export default Slots;
