import React, { Component } from "react";
import { Link } from "react-router-dom";
import SideBarItem from "./SideBarItem";

const SideBarView = ({ selected }) => {
  return (
    <div id="sidebar-wrapper">
      <ul className="sidebar-nav">
        <li className="sidebar-brand">
          <Link to="/">
            <span className="text-white">
              <b>Static Sidebar Navbar </b>
            </span>
          </Link>
        </li>
        <SideBarItem
          link="/dashboard"
          title="Dashboard"
          faIcon="fas fa-chart-bar"
          selected={selected}
        />
        <SideBarItem
          link="/notification"
          title="Issue Notification"
          faIcon="fas fa-home"
          selected={selected}
        />
      </ul>
    </div>
  );
};

export default SideBarView;
