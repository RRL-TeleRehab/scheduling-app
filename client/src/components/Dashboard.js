import React from "react";
import SideBarView from "./SideBarView";
import NavBar from "./NavBar";

const Dashboard = () => {
  return (
    <div id="wrapper" className="toggled">
      <SideBarView selected="/" />
      <div id="page-content-wrapper " className="">
        <NavBar />
        <div className="container-fluid ">
          <h1>Dashboard</h1>
          <p>
            Here all suspicion needs must be abandoned, Here all suspicion needs
            must be abandoned,Here all suspicion needs must be abandoned,Here
            all suspicion needs must be abandoned,Here all suspicion needs must
            be abandoned,Here all suspicion needs must be abandoned,Here all
            suspicion needs must be abandoned,Here all suspicion needs must be
            abandoned,Here all suspicion needs must be abandoned,Here all
            suspicion needs must be abandoned,Here all suspicion needs must be
            abandoned,Here all suspicion needs must be abandoned,Here all
            suspicion needs must be abandoned,Here all suspicion needs must be
            abandoned,Here all suspicion needs must be abandoned,Here all
            suspicion needs must be abandoned,
            <br />
            All cowardice must needs be here extinct."
            <br />
            <br />
            There is no one who loves pain itself, who seeks after it and wants
            to have it, simply because it is pain. <br />
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, <br />
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.{" "}
            <br />
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
