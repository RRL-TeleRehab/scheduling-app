import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SideBarView from "../SideBarView";
import NavBar from "../NavBar";
import { getCookie } from "../../auth/helpers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import storage from "../../firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const UpdateStory = ({ match }) => {
  const allInputs = { imgUrl: "" };
  const [values, setValues] = useState({
    storyTitle: "",
    storyHeading: "",
    storyContent: "",
    storyLink: "",
    storyImageAsUrl: "",
  });
  const inputFile = useRef(null);
  const [imageAsFile, setImageAsFile] = useState("");
  const [imageAsUrl, setImageAsUrl] = useState(allInputs);

  const { storyTitle, storyHeading, storyContent, storyLink, storyImageAsUrl } =
    values;

  const token = getCookie("token");

  const getStory = (storyId) => {
    axios({
      method: "GET",
      url: `${process.env.REACT_APP_API}/story/${storyId}`,
    })
      .then((response) => {
        setValues({
          ...values,
          storyTitle: response.data.title,
          storyHeading: response.data.heading,
          storyContent: response.data.content,
          storyLink: response.data.link,
          storyImageAsUrl: response.data.coverPhoto,
        });
      })
      .catch((error) => {
        console.log("Stories ERROR", error.response.data.error);
      });
  };

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  console.log(imageAsFile);
  const handleImageAsFile = (event) => {
    const image = event.target.files[0];
    setImageAsFile((imageFile) => image);
  };

  const onButtonClick = () => {
    inputFile.current.click();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios({
      method: "PUT",
      url: `${process.env.REACT_APP_API}/admin/story/${match.params.storyId}`,
      headers: { Authorization: `Bearer ${token}` },
      data: {
        storyTitle,
        storyHeading,
        storyContent,
        storyLink,
        storyImageAsUrl,
      },
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

  const handleFirebaseUpdate = (event) => {
    event.preventDefault();
    console.log("start of upload");
    if (imageAsFile === "") {
      console.error(`not an image, the image file is a ${typeof imageAsFile}`);
    }
    console.log(imageAsFile.name);

    const storageRef = ref(storage, `/storyImages/${imageAsFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageAsFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log(snapshot);
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setImageAsUrl((prevObject) => ({
            ...prevObject,
            imgUrl: url,
          }));
          setValues({ ...values, storyImageAsUrl: url });
        });
      }
    );
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
            <div className="input-group mb-4">
              <img
                src={storyImageAsUrl}
                className="img-fluid img-thumbnail"
                style={{ width: "100px", height: "100px" }}
              ></img>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageAsFile}
                ref={inputFile}
                style={{ display: "none" }}
              />
            </div>
            <span onClick={onButtonClick}>edit</span>
            <button className="btn btn-primary" onClick={handleFirebaseUpdate}>
              Update Image
            </button>
          </form>

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
      {/* {JSON.stringify(imageAsUrl.imgUrl)} */}
    </div>
  );
};

export default UpdateStory;
