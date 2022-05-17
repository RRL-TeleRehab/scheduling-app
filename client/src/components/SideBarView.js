import React from "react";
import { Link } from "react-router-dom";
import SideBarItem from "./SideBarItem";
import appLogo from "../media/logo3.svg";

const SideBarView = ({ selected }) => {
  return (
    <div id="sidebar-wrapper">
      <ul className="sidebar-nav">
        <li className="sidebar-brand">
          <Link to="/" className="app-logo-brand">
            <img
              src={appLogo}
              alt="PROMOTE"
              className="app-logo-brand-img"
            ></img>
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
