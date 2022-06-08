import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import "./styles/ResetPassword.css";
import logo from "../media/logo.svg";

const ResetPassword = ({ match }) => {
  // we get props.match from react router dom
  const [values, setValues] = useState({
    email: "",
    buttonText: "Send",
    hover: false,
  });

  const { email, buttonText, hover } = values;

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
    setValues({ ...values, buttonText: "Requesting password reset link" });
    axios({
      method: "PUT",
      url: `${process.env.REACT_APP_API}/forgot-password`,
      data: { email },
    })
      .then((response) => {
        console.log(" Forgot Password Success", response);
        toast.success(response.data.message);
        setValues({ ...values, buttonText: "Request email sent", email: "" });
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

  const resetPasswordForm = () => (
    <form>
      <div className="form-outline mb-4">
        <input
          className="form-control mt-4"
          type="email"
          value={email}
          placeholder="Email"
          onChange={handleChange("email")}
          required
        ></input>
      </div>

      <button
        onClick={handleSubmit}
        className={`form-control btn mb-2 ${
          hover ? "reset-password-btn-hover" : "reset-password-btn"
        }`}
        onMouseEnter={handleMouseIn}
        onMouseLeave={handleMouseOut}
      >
        {buttonText}
      </button>
    </form>
  );

  return (
    <div className="password-reset-form col-md-4 offset-md-4">
      <ToastContainer></ToastContainer>
      <div className="password-reset-form-info">
        <img
          src={logo}
          alt="promote"
          className="password-reset-form-logo"
        ></img>
        <h2 className="password-reset-form-heading">Reset Your Password</h2>
      </div>
      <h6 className="password-reset-form-text mt-2">
        {" "}
        Tell us your email address, and we'll email you instructions on how to
        reset your password
      </h6>
      {resetPasswordForm()}
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

export default ResetPassword;
