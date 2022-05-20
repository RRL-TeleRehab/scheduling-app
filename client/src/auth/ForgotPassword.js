import React, { Fragment, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import "./styles/ForgotPassword.css";
import logo from "../media/logo.svg";
import { Link } from "react-router-dom";

// history prop comes from react-router-dom
const ForgotPassword = ({ history }) => {
  const [values, setValues] = useState({
    newPassword: "",
    confirmNewPassword: "",
    buttonText: "Confirm",
    hover: false,
  });

  const { newPassword, confirmNewPassword, buttonText, hover } = values;

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
      data: { newPassword, confirmNewPassword },
    })
      .then((response) => {
        console.log(" Forgot Password Success", response);
        toast.success(response.data.message);
        setValues({ ...values, buttonText: "Request email sent" });
      })
      .catch((error) => {
        console.log("Forgot Password Failure", error);
        setValues({ ...values, buttonText: "Submit" });
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
              onChange={handleChange("password")}
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
              onChange={handleChange("confirmPassword")}
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
  );
};

export default ForgotPassword;
