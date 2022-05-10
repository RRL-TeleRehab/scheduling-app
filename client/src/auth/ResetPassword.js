import React, { useState } from "react";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const ResetPassword = ({ match }) => {
  // we get props.match from react router dom
  const [values, setValues] = useState({
    email: "",
    buttonText: "Request password reset link",
  });

  const { email, buttonText } = values;

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
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

  const resetPasswordForm = () => (
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
        <h1>Reset Password</h1>
        {resetPasswordForm()}
      </div>
    </Layout>
  );
};

export default ResetPassword;
