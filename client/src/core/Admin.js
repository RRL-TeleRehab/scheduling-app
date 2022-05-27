import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { isAuth, getCookie, signout, updateUserInfo } from "../auth/helpers";

const Admin = ({ history }) => {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    buttonText: "Update",
  });

  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    buttonText,
    role,
  } = values;

  const token = getCookie("token");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    axios({
      method: "GET",
      url: `${process.env.REACT_APP_API}/user/${isAuth()._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        // console.log("PRIVATE PROFILE", response);
        const { firstName, lastName, email, role } = response.data;
        setValues({ ...values, firstName, lastName, email, role });
      })
      .catch((error) => {
        console.log("PRIVATE PROFILE ERROR", error.response.data.error);
        if (error.response.status === 401) {
          signout(() => {
            history.push("/");
          });
        }
        toast.error(error.response.data.error);
      });
  };

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: "Updating" });
    axios({
      method: "PUT",
      url: `${process.env.REACT_APP_API}/admin/update`,
      data: { firstName, lastName, password, confirmPassword },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log("PRIVATE PROFILE UPDATE SUCCESS", response);
        updateUserInfo(response, () => {
          setValues({
            ...values,
            buttonText: "Update",
          });
          toast.success("Profile Updated Successfully");
        });
      })
      .catch((error) => {
        console.log("PRIVATE PROFILE UPDATE ERROR", error.response.data.errors);
        setValues({ ...values, buttonText: "Update" });
        toast.error("Profile Update Failed. Please try again");
        toast.error(error.response.data.errors);
      });
  };

  const updateForm = () => (
    <form>
      <div className="row mb-4">
        <div className="col-3">
          <label>Profile Type:</label>
        </div>
        <div className="col">
          <label>{role.toUpperCase()}</label>
        </div>
      </div>
      <div className="row mb-4">
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
          defaultValue={email}
          disabled
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
        className="form-control btn btn-dark btn-block mb-4"
      >
        {buttonText}
      </button>
    </form>
  );

  return (
    <div className="col-md-6 offset-md-3 mt-3">
      <ToastContainer></ToastContainer>
      <h1 className="pt-5 text-center"> Admin Profile Update</h1>
      {updateForm()}
    </div>
  );
};

export default Admin;
