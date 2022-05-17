import React, { Fragment } from "react";
import { Link, withRouter } from "react-router-dom";
import { isAuth, signout } from "./auth/helpers";
import "./App.css";

const App = ({ match, history }) => {
  const header = () => (
    <nav className="navbar navbar-inverse navbar-fixed-top">
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
      {isAuth() && isAuth().role === "admin" && (
        <div className="username">
          {isAuth().firstName} {isAuth().lastName}
        </div>
      )}

      {isAuth() && isAuth().role === "patient" && (
        <div className="username">
          {isAuth().firstName} {isAuth().lastName}
        </div>
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
  );

  return (
    <Fragment>
      {header()}
      <div>This is the Landing Page</div>
    </Fragment>
  );
};
export default withRouter(App);
