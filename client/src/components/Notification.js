import React from "react";
import SideBarView from "./SideBarView";
import NavBar from "./NavBar";

const Notification = () => {
  return (
    <div id="wrapper" className="toggled">
      <SideBarView selected="/" />
      <div id="page-content-wrapper " className="">
        <NavBar />
        <div className="container-fluid ">
          <h1>Notifications</h1>
          <p>Notification</p>
        </div>
      </div>
    </div>
  );
};

export default Notification;
