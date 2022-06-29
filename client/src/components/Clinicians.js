import React, { useState, useEffect } from "react";
import SideBarView from "./SideBarView";
import NavBar from "./NavBar";
import axios from "axios";
import { getCookie } from "../auth/helpers";
import Card from "./Card/Card";
import { Link } from "react-router-dom";

const Clinicians = () => {
  const [values, setValues] = useState({
    clinicians: [],
    searchQuery: "",
  });

  const { clinicians, searchQuery } = values;
  const token = getCookie("token");

  const getHubClinicians = () => {
    axios({
      method: "GET",
      url: `${process.env.REACT_APP_API}/clinicians`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        console.log(response);
        setValues({ ...values, clinicians: response.data });
      })
      .catch((error) => {
        console.log("Stories ERROR", error.response.data.error);
      });
  };

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value, searched: false });
  };

  useEffect(() => {
    getHubClinicians();
  }, []);

  return (
    <div id="wrapper" className="toggled">
      <SideBarView selected="/" />
      <div id="page-content-wrapper " className="">
        <NavBar />
        <div className="container-fluid ">
          {/* <p>{JSON.stringify(clinicians)}</p> */}
          <div className="input-group input-group-lg">
            <input
              type="search"
              className="form-control"
              placeholder="Search clinicians here......"
              onChange={handleChange("searchQuery")}
            />
          </div>
          <div className="row mt-2">
            {clinicians
              .filter((clinician) => {
                if (searchQuery === "") {
                  return clinician;
                } else if (
                  clinician.firstName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  clinician.lastName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  clinician.aboutClinician
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                ) {
                  return clinician;
                }
              })
              .map((c, index) => (
                <div key={c._id} className="col-4 mb-3">
                  <Link to={`/clinicians/${c._id}`}>
                    <Card clinician={c}></Card>{" "}
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clinicians;
