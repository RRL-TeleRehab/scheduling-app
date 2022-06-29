import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuth } from "./helpers";

// this is the component that will be used for rendering if the user is authenticated

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isAuth() ? (
        <Component {...props}></Component>
      ) : (
        <Redirect
          to={{
            pathname: "/signin",
            state: { from: props.location },
          }}
        />
      )
    }
  ></Route>
);
export default PrivateRoute;
