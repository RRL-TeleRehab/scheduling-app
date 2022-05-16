import React, { Fragment } from "react";
import { Link, withRouter } from "react-router-dom";
import { isAuth, signout } from "../auth/helpers";
import appLogo from "../media/logo.svg";
import "./Layout.css";
// history is injected as a prop to the Layout component as it is wrapped in the withRouter HOC

const Layout = ({ children, match, history }) => {
  const isActive = (path) => {
    if (match.path === path) {
      return { color: "#0EB246" };
    } else {
      return { color: "#ffffff" };
    }
  };

  const nav = () => (
    <Fragment>
      <nav className="navbar nav-style">
        <Link to="/" className="app-logo">
          <img src={appLogo} alt="PROMOTE"></img>
        </Link>
        {!isAuth() && (
          <div>
            {(match.path === "/signup" || match.path === "/") && (
              <Link to="/signin">
                <button className="btn btn-login custom">Login</button>
              </Link>
            )}
            {(match.path === "/signin" || match.path === "/") && (
              <Link to="/signup">
                <button className="btn btn-register custom">Register</button>
              </Link>
            )}
          </div>
        )}

        {/* Make the Name page clickable to redirect to their home pages. For Admin admin.js and user private.js */}

        {isAuth() && isAuth().role === "admin" && (
          <Link
            className="nav-link username"
            to="/admin"
            style={isActive("/admin")}
          >
            {isAuth().firstName} {isAuth().lastName}
          </Link>
        )}

        {isAuth() && isAuth().role === "patient" && (
          <Link
            className="nav-link username"
            to="/private"
            style={isActive("/private")}
          >
            {isAuth().firstName} {isAuth().lastName}
          </Link>
        )}

        {isAuth() && (
          <div>
            <button
              className="btn btn-logout custom"
              onClick={() => {
                signout(() => {
                  history.push("/");
                });
              }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </Fragment>
  );
  return (
    <Fragment>
      {nav()}
      {children}
    </Fragment>
  );
};

export default withRouter(Layout);
