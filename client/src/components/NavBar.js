import React from "react";
import NavBarMenuWrapper from "./NavBarMenuWrapper";

const NavBar = () => {
  return (
    <div className="main-navbar">
      <nav className="navbar default-layout-navbar  col-12 p-0  d-flex flex-row mb-1 ">
        <NavBarMenuWrapper />
      </nav>
    </div>
  );
};

export default NavBar;
