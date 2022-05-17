import React, { Fragment, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { authenticate, isAuth } from "./helpers";
import logo from "../media/logo.svg";
import "./styles/Signin.css";

// history prop comes from react-router-dom
const Signin = ({ history }) => {
  const [values, setValues] = useState({
    email: "",
    password: "",
    buttonText: "Login",
    hover: false,
  });

  const { email, password, buttonText, hover } = values;

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
      url: `${process.env.REACT_APP_API}/signin`,
      data: { email, password },
    })
      .then((response) => {
        console.log("SignIn Success", response);
        // save the response user in local storage and token in cookie
        authenticate(response, () => {
          setValues({
            ...values,
            email: "",
            password: "",
            buttonText: "Signing In",
          });
          toast.success(`${response.data.user.firstName} Welcome!`);
          isAuth() && isAuth().role === "admin"
            ? history.push("/admin")
            : history.push("/private");
        });
      })
      .catch((error) => {
        console.log("SignIn error", error);
        setValues({ ...values, buttonText: "SignIn" });
        toast.error(error.response.data.error);
      });
  };

  const signInForm = () => (
    <form>
      <div className="form-outline mt-4 mb-4">
        <input
          className="form-control"
          type="email"
          value={email}
          placeholder="Email"
          onChange={handleChange("email")}
        ></input>
      </div>

      <div className="form-outline mb-2">
        <div className="">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={handleChange("password")}
          ></input>
        </div>
      </div>
      <div className="forgot-password-redirect mb-2 ml-2">
        <p> Forgot Password?</p>
        {"  "}
        <Link
          to="/auth/password/reset"
          className="forgot-password-redirect-link"
        >
          Click here
        </Link>
      </div>
      <button
        onClick={handleSubmit}
        className={`form-control btn mb-2
          ${hover ? "signin-btn-hover" : "signin-btn"}`}
        onMouseEnter={handleMouseIn}
        onMouseLeave={handleMouseOut}
      >
        {buttonText}
      </button>
    </form>
  );

  return (
    <Fragment>
      {/* <Layout></Layout> */}

      <div className="user-signin-form col-md-4 offset-md-4">
        <ToastContainer></ToastContainer>
        {isAuth() ? <Redirect to="/" /> : null}
        <div className="user-signin-form-info">
          <img src={logo} className="user-signin-logo" alt="PROMOTE"></img>
          <h2 className="user-signin-text">Sign In</h2>
        </div>
        {signInForm()}
        <div className="user-signup-redirect ml-2">
          <p> Not a member yet? </p>
          {"  "}
          <Link to="/signup" className="user-signup-redirect-link">
            Register
          </Link>
        </div>
      </div>
    </Fragment>
  );
};

export default Signin;
