import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { authenticate, isAuth } from "./helpers";

const Signin = () => {
  const [values, setValues] = useState({
    email: "guntha@ualberta.ca",
    password: "Shmi97@hul!q",
    buttonText: "SignIn",
  });

  const { email, password, buttonText } = values;

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
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
      <div className="form-outline mb-4">
        <input
          className="form-control"
          type="email"
          value={email}
          placeholder="Email address"
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
      </div>
      <button
        onClick={handleSubmit}
        className="form-control btn btn-dark btn-block mb-4"
      >
        {buttonText}
      </button>
    </form>
  );

  return (
    <Layout>
      <div className="col-md-6 offset-md-3 mt-3">
        <ToastContainer></ToastContainer>
        {isAuth() ? <Redirect to="/" /> : null}
        <h1>User SignIn</h1>
        {signInForm()}
      </div>
    </Layout>
  );
};

export default Signin;
