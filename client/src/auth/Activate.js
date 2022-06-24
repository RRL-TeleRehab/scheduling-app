import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import jwt from "jsonwebtoken";

// match is injected from BrowserRouter which is provide as a prop to the Activate component as it is wrapped in the BrowserRouter
const Activate = ({ match }) => {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    token: "",
    show: true,
  });

  useEffect(() => {
    let token = match.params.token;
    let { firstName, lastName } = jwt.decode(token);
    console.log(token);
    if (token) {
      setValues({ ...values, firstName, lastName, token });
    }
  }, []);

  const { firstName, lastName, token, show } = values;

  const clickSubmit = (event) => {
    event.preventDefault();

    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}/account-activation`,
      data: { token },
    })
      .then((response) => {
        console.log("ACCOUNT ACTIVATION", response);
        setValues({
          ...values,
          show: false,
        });
        toast.success(response.data.message);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.response.data.error);
      });
  };

  const activationLink = () => (
    <div className="text-center">
      <h1 className="p-5 ">
        Hey {firstName} {lastName}, Ready to activate your Account{" "}
      </h1>
      <button className="btn btn-dark center" onClick={clickSubmit}>
        Activate Account
      </button>
    </div>
  );

  return (
    <div className="col-md-6 offset-md-3 mt-3">
      <ToastContainer></ToastContainer>
      {activationLink()}
    </div>
  );
};

export default Activate;
