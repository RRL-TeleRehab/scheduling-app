import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import App from "./App";
import Signup from "./auth/Signup";
import Signin from "./auth/Signin";
import Activate from "./auth/Activate";
import Private from "./core/Private";
import Admin from "./core/Admin";
import PrivateRoute from "./auth/PrivateRoute";
import AdminRoute from "./auth/AdminRoute";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import Dashboard from "./components/Dashboard";
import Notification from "./components/Notification";

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={App} />
        <Route path="/dashboard" exact component={Dashboard}></Route>
        <Route path="/notification" exact component={Notification}></Route>

        <Route path="/signin" exact component={Signin} />
        <Route path="/signup" exact component={Signup} />
        <Route path="/auth/activate/:token" exact component={Activate} />
        <PrivateRoute path="/private" exact component={Private}></PrivateRoute>
        <AdminRoute path="/admin" exact component={Admin}></AdminRoute>
        <Route
          path="/auth/password/forgot"
          exact
          component={ForgotPassword}
        ></Route>
        <Route
          path="/auth/password/reset"
          exact
          component={ResetPassword}
        ></Route>
      </Switch>
    </Router>
  );
};

export default Routes;
