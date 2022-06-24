import React, { Component } from "react";
import "./Card.css";

const MAX_LENGTH = 270;

const Card = ({ clinician }) => {
  return (
    <div className="card card-main">
      <div className="row g-0">
        <div className="col-3">
          <img className="card-image" src={clinician.profilePhoto}></img>
        </div>
        <div className="col-9">
          <h5 className="card-title">
            {clinician.firstName} {clinician.lastName}
          </h5>
          <p className="card-body">
            {`${clinician.aboutClinician.substring(0, MAX_LENGTH)}...`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
