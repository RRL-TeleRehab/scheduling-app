import React, { useState, useEffect, Fragment } from "react";
import SideBarView from "../SideBarView";
import NavBar from "../NavBar";
import axios from "axios";
import { Link } from "react-router-dom";
import { getCookie } from "../../auth/helpers.js";
import { ref, deleteObject, getStorage } from "firebase/storage";

const Stories = () => {
  const [values, setValues] = useState({
    stories: [],
  });

  const { stories } = values;
  const token = getCookie("token");

  useEffect(() => {
    getAllStories();
  }, []);

  const getAllStories = () => {
    axios({
      method: "GET",
      url: `${process.env.REACT_APP_API}/story`,
    })
      .then((response) => {
        // console.log("All Stories", response.data);
        setValues({ ...values, stories: response.data });
      })
      .catch((error) => {
        console.log("Stories ERROR", error.response.data.error);
      });
  };

  const deleteImageFromFirebase = (url) => {
    const storage = getStorage();
    const desertRef = ref(storage, `${url}`);
    deleteObject(desertRef)
      .then(() => {
        console.log("image Deleted successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteStory = (storyId, url) => {
    deleteImageFromFirebase(url);
    axios({
      method: "DELETE",
      url: `${process.env.REACT_APP_API}/admin/story/${storyId}`,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        getAllStories();
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
        <div className="container-fluid ">
          <h5>Stories</h5>
          <Link to="/admin/newStory">
            <button className="btn btn-primary"> Add Story</button>{" "}
          </Link>
          <div>
            {stories.length > 0
              ? stories.map((story, key) => (
                  <Fragment key={story._id}>
                    <h3>{story.title}</h3>
                    <Link to={`/admin/story/update/${story._id}`}>
                      <span>Edit</span>
                    </Link>
                    <span
                      className="btn btn-danger"
                      onClick={() => {
                        deleteStory(story._id, story.coverPhoto);
                      }}
                    >
                      Delete
                    </span>
                    <h6>{story.heading}</h6>
                    <p>{story.content}</p>
                    {story.link ? <p>{story.link}</p> : ""}
                    <p>Story Added at : {story.createdAt}</p>
                    <p>Story last Updated at : {story.updatedAt}</p>
                    <p>Story ID: {story._id}</p>
                    {story.coverPhoto ? (
                      <img
                        className="img-thumbnail"
                        src={story.coverPhoto}
                        alt="No Image"
                      ></img>
                    ) : (
                      "No cover photo found"
                    )}
                    <hr></hr>
                  </Fragment>
                ))
              : "No stories found"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stories;
