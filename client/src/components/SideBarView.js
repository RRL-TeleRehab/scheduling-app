import React from "react";
import { Link } from "react-router-dom";
import SideBarItem from "./SideBarItem";
import appLogo from "../media/logo3.svg";
import { isAuth } from "../auth/helpers";

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
          link="/profile"
          title="Profile"
          faIcon="fas fa-chart-bar"
          selected={selected}
        />
        <SideBarItem
          link="/notification"
          title="Issue Notification"
          faIcon="fas fa-home"
          selected={selected}
        />
        {isAuth() && isAuth().role === "admin" && (
          <SideBarItem
            link="/admin/stories"
            title="Story"
            faIcon="fas fa-book"
            selected={selected}
          ></SideBarItem>
        )}
      </ul>
    </div>
  );
};

export default SideBarView;
