import React, { useState } from "react";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

// history prop comes from react-router-dom
const ForgotPassword = ({ history }) => {
  const [values, setValues] = useState({
    newPassword: "",
    confirmNewPassword: "",
    buttonText: "Update Password",
  });

  const { newPassword, confirmNewPassword, buttonText } = values;

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
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
      <div className="row mb-4">
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
        <h1>Forgot Password</h1>
        {forgotPasswordForm()}
      </div>
    </Layout>
  );
};

export default ForgotPassword;
