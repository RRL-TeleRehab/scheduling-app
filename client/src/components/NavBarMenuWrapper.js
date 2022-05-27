import React from "react";
import { Link } from "react-router-dom";
import { isAuth } from "../auth/helpers";

const NavBarMenuWrapper = () => {
  return (
    <div className="navbar-menu-wrapper d-flex align-items-stretch">
      {isAuth() && isAuth().role === "admin" && (
        <div className="username">
          {isAuth().firstName} {isAuth().lastName}
        </div>
      )}

      {isAuth() && (isAuth().role === "hub" || isAuth().role === "spoke") && (
        <div className="username">
          {isAuth().firstName} {isAuth().lastName}
        </div>
      )}
    </div>
  );
};

export default NavBarMenuWrapper;
