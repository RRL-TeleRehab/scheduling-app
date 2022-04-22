import React, { Fragment } from "react";
import { Link, withRouter } from "react-router-dom";
import { isAuth, signout } from "../auth/helpers";
// history is injected as a prop to the Layout component as it is wrapped in the withRouter HOC

const Layout = ({ children, match, history }) => {
  const isActive = (path) => {
    if (match.path === path) {
      return { color: "#f01fb2" };
    } else {
      return { color: "#ffffff" };
    }
  };

  const nav = () => (
    <ul className="nav nav-tabs bg-dark">
      <li className="nav-item">
        <Link to="/" className="nav-link" style={isActive("/")}>
          Home
        </Link>
      </li>

      {!isAuth() && (
        <Fragment>
          <li className="nav-item">
            <Link
              to="/signin"
              className=" nav-link"
              style={isActive("/signin")}
            >
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/signup"
              className=" nav-link"
              style={isActive("/signup")}
            >
              Register
            </Link>
          </li>
        </Fragment>
      )}

      {isAuth() && (
        <li className="nav-item">
          <span className="nav-link" style={{ color: "#fff" }}>
            {" "}
            {isAuth().firstName} {isAuth().lastName}
          </span>
        </li>
      )}

      {isAuth() && (
        <Fragment>
          <li className="nav-item">
            <span
              className="nav-link"
              style={{ cursor: "pointer", color: "#fff" }}
              onClick={() => {
                signout(() => {
                  history.push("/");
                });
              }}
            >
              Logout
            </span>
          </li>
        </Fragment>
      )}
    </ul>
  );
  return (
    <Fragment>
      {nav()}
      <div className="container">{children}</div>
    </Fragment>
  );
};

export default withRouter(Layout);
