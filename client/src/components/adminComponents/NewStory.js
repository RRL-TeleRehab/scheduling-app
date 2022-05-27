import React, { useState } from "react";
import SideBarView from "../SideBarView";
import NavBar from "../NavBar";
import axios from "axios";
import { getCookie } from "../../auth/helpers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const NewStory = ({ history }) => {
  const [values, setValues] = useState({
    storyTitle: "",
    storyHeading: "",
    storyContent: "",
    storyLink: "",
  });

  const { storyTitle, storyHeading, storyContent, storyLink } = values;
  const token = getCookie("token");

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}/admin/story`,
      headers: { Authorization: `Bearer ${token}` },
      data: { storyTitle, storyHeading, storyContent, storyLink },
    })
      .then((response) => {
        setValues({
          ...values,
          storyTitle: "",
          storyHeading: "",
          storyContent: "",
          storyLink: "",
        });
        console.log("Created Stories", response.data);
        toast.success("Story added successfully");
        history.push("/admin/stories");
      })
      .catch((error) => {
        console.log("Stories ERROR", error);
      });
  };

  return (
    <div id="wrapper" className="toggled">
      <SideBarView selected="/" />
      <div id="page-content-wrapper " className="">
        <NavBar />
        <div className="container-fluid">
          <ToastContainer></ToastContainer>
          <p>New Story</p>
          <form>
            <div className="form-outline mb-4">
              <input
                className="form-control"
                type="text"
                value={storyTitle}
                placeholder="Title"
                onChange={handleChange("storyTitle")}
              ></input>
            </div>
            <div className="form-outline mb-4">
              <input
                className="form-control"
                type="text"
                value={storyHeading}
                placeholder="Heading"
                onChange={handleChange("storyHeading")}
              ></input>
            </div>
            <div className="form-outline mb-4">
              <textarea
                className="form-control"
                type="text"
                value={storyContent}
                placeholder="Description"
                onChange={handleChange("storyContent")}
              ></textarea>
            </div>
            <div className="input-group mb-4">
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon3">
                  Story URL
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                value={storyLink}
                onChange={handleChange("storyLink")}
              />
            </div>
            <button onClick={handleSubmit} className={`btn btn-primary`}>
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewStory;
