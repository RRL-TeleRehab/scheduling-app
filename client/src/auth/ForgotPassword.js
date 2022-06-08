import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import "./styles/ForgotPassword.css";
import logo from "../media/logo.svg";
import { Link } from "react-router-dom";
import jwt from "jsonwebtoken";

// history prop comes from react-router-dom
const ForgotPassword = ({ match }) => {
  const [values, setValues] = useState({
    firstName: "",
    newPassword: "",
    confirmNewPassword: "",
    token: "",
    buttonText: "Confirm",
    hover: false,
    lastName: "",
  });

  const {
    firstName,
    lastName,
    token,
    newPassword,
    confirmNewPassword,
    buttonText,
    hover,
  } = values;

  useEffect(() => {
    let token = match.params.token;
    console.log(token);
    let { firstName, lastName } = jwt.decode(token);
    console.log(firstName, lastName);
    if (token) {
      setValues({ ...values, firstName, lastName, token });
    }
  }, []);

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleMouseIn = () => {
    setValues({ ...values, hover: true });
  };

  const handleMouseOut = () => {
    setValues({ ...values, hover: false });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: "Updating Password" });
    axios({
      method: "PUT",
      url: `${process.env.REACT_APP_API}/reset-password`,
      data: { newPassword, confirmNewPassword, resetPasswordLink: token },
    })
      .then((response) => {
        console.log(" Reset Password Success", response);
        toast.success(response.data.message);
        setValues({
          ...values,
          buttonText: "Password Updated",
          newPassword: "",
          confirmNewPassword: "",
        });
      })
      .catch((error) => {
        console.log("Reset Password Failure", error);
        setValues({ ...values, buttonText: "Confirm" });
        if (error && error.response.data.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error(error.response.data.errors);
        }
      });
  };

  const forgotPasswordForm = () => (
    <form>
      <div className="row mt-4 mb-4">
        <div className="col">
          <div className="form-outline">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={newPassword}
              onChange={handleChange("newPassword")}
              required
            />
          </div>
        </div>
        <div className="col">
          <div className="form-outline">
            <input
              type="password"
              className="form-control"
              placeholder="Confirm Password"
              value={confirmNewPassword}
              onChange={handleChange("confirmNewPassword")}
              required
            />
          </div>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className={`form-control btn mb-2 ${
          hover ? "forgot-password-btn-hover" : "forgot-password-btn"
        }`}
        onMouseEnter={handleMouseIn}
        onMouseLeave={handleMouseOut}
      >
        {buttonText}
      </button>
    </form>
  );

  return (
    <Fragment>
      <div>{firstName + lastName}</div>
      <div className="forgot-password-form col-md-4 offset-md-4">
        <ToastContainer></ToastContainer>
        <div className="forgot-password-form-info">
          <img
            src={logo}
            alt="promote"
            className="forgot-password-form-logo"
          ></img>
          <h2 className="forgot-password-form-heading">Reset Password</h2>
        </div>
        {forgotPasswordForm()}
        <div className="user-signin-redirect ml-2">
          <p> Go Back </p>
          {"  "}
          <Link to="/signin" className="user-signin-redirect-link">
            Login
          </Link>
        </div>
      </div>
    </Fragment>
  );
};

export default ForgotPassword;
