import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { isAuth } from "../auth/helpers";
import logo from "../media/logo.svg";
import "./styles/Signup.css";

const Signup = () => {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    buttonText: "Register",
    hover: false,
  });

  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    buttonText,
    hover,
  } = values;

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
    setValues({ ...values, buttonText: "Submitting" });
    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}/signup`,
      data: { firstName, lastName, email, password, confirmPassword },
    })
      .then((response) => {
        console.log(response);
        setValues({
          ...values,
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          buttonText: "Email Sent",
        });
        toast.success(response.data.message);
      })
      .catch((error) => {
        if (error.response.data.errors) {
          console.log(error);
          setValues({ ...values, buttonText: "Register" });
          toast.error(error.response.data.errors);
        }
        console.log(error);
        setValues({ ...values, buttonText: "Register" });
        toast.error(error.response.data.error);
      });
  };

  const signupForm = () => (
    <form>
      <div className="row mt-4 mb-4">
        <div className="col">
          <div className="form-outline">
            <input
              type="radio"
              className="form-check-input"
              value="option1"
              name="signup-type"
            />
            <label class="form-check-label signup-type-label">
              Spoke Clinician
            </label>
          </div>
        </div>
        <div className="col">
          <div className="form-outline">
            <input
              type="radio"
              className="form-check-input"
              value="option1"
              name="signup-type"
            />
            <label class="form-check-label signup-type-label">
              Hub Clinician
            </label>
          </div>
        </div>
      </div>
      <div className="row mb-4 ">
        <div className="col">
          <div className="form-outline">
            <input
              type="text"
              className="form-control"
              placeholder="First Name"
              value={firstName}
              onChange={handleChange("firstName")}
            />
          </div>
        </div>
        <div className="col">
          <div className="form-outline">
            <input
              type="text"
              className="form-control"
              placeholder="Last Name"
              value={lastName}
              onChange={handleChange("lastName")}
            />
          </div>
        </div>
      </div>
      <div className="form-outline mb-4">
        <input
          className="form-control"
          type="email"
          value={email}
          placeholder="Email"
          onChange={handleChange("email")}
        ></input>
      </div>
      <div className="row mb-4">
        <div className="col">
          <div className="form-outline">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
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
              value={confirmPassword}
              onChange={handleChange("confirmPassword")}
            />
          </div>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className={`form-control btn mb-2 ${
          hover ? "signup-btn-hover" : "signup-btn"
        }`}
        onMouseEnter={handleMouseIn}
        onMouseLeave={handleMouseOut}
      >
        {buttonText}
      </button>
    </form>
  );

  return (
    <div className="user-signup-form col-md-4 offset-md-4">
      <ToastContainer></ToastContainer>
      {isAuth() ? <Redirect to="/" /> : null}
      <div className="user-signup-form-info">
        <img src={logo} className="user-signup-logo" alt="PROMOTE"></img>
        <h2 className="user-singup-text">Sign Up</h2>
      </div>
      {signupForm()}
      <div className="user-signin-redirect ml-2">
        <p> Already have an account? </p>
        {"  "}
        <Link to="/signin" className="user-signin-redirect-link">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Signup;
