import React, { useState, useEffect } from "react";
import axios from "axios";
import SideBarView from "../SideBarView";
import NavBar from "../NavBar";
import { getCookie } from "../../auth/helpers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const UpdateStory = ({ match }) => {
  const [values, setValues] = useState({
    storyTitle: "",
    storyHeading: "",
    storyContent: "",
    storyLink: "",
  });

  const { storyTitle, storyHeading, storyContent, storyLink } = values;

  const token = getCookie("token");

  const getStory = (storyId) => {
    axios({
      method: "GET",
      url: `${process.env.REACT_APP_API}/story/${storyId}`,
    })
      .then((response) => {
        // console.log("All Stories", response.data);

        setValues({
          ...values,
          storyTitle: response.data.title,
          storyHeading: response.data.heading,
          storyContent: response.data.content,
          storyLink: response.data.link,
        });
      })
      .catch((error) => {
        console.log("Stories ERROR", error.response.data.error);
      });
  };

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios({
      method: "PUT",
      url: `${process.env.REACT_APP_API}/admin/story/${match.params.storyId}`,
      headers: { Authorization: `Bearer ${token}` },
      data: { storyTitle, storyHeading, storyContent, storyLink },
    })
      .then((response) => {
        console.log("Created Stories", response.data);
        toast.success("Story updated successfully");
      })
      .catch((error) => {
        console.log("Stories ERROR", error);
        toast.error(error.response.data.error);
      });
  };

  useEffect(() => {
    getStory(match.params.storyId);
  }, [match.params.storyId]);

  return (
    <div id="wrapper" className="toggled">
      <SideBarView selected="/" />
      <div id="page-content-wrapper " className="">
        <NavBar />
        <div className="container-fluid">
          <ToastContainer></ToastContainer>
          <p>Update Story</p>
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

export default UpdateStory;
