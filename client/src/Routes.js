import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import App from "./App";
import Signup from "./auth/Signup";
import Signin from "./auth/Signin";
import Activate from "./auth/Activate";
import PrivateRoute from "./auth/PrivateRoute";
import AdminRoute from "./auth/AdminRoute";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import Profile from "./components/Profile";
import Notification from "./components/Notification";
import PageNotFound from "./components/PageNotFound";
import AdminProfile from "./components/AdminProfile";
import Stories from "./components/adminComponents/Stories";
import NewStory from "./components/adminComponents/NewStory";
import UpdateStory from "./components/adminComponents/UpdateStory";

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={App} />
        <Route path="/signin" exact component={Signin} />
        <Route path="/signup" exact component={Signup} />
        <Route path="/auth/activate/:token" exact component={Activate} />
        <PrivateRoute path="/profile" exact component={Profile}></PrivateRoute>
        <PrivateRoute
          path="/notification"
          exact
          component={Notification}
        ></PrivateRoute>
        <AdminRoute path="/profile" exact component={AdminProfile}></AdminRoute>
        <AdminRoute
          path="/admin/stories"
          exact
          component={Stories}
        ></AdminRoute>
        <AdminRoute
          path="/admin/newStory"
          exact
          component={NewStory}
        ></AdminRoute>
        <AdminRoute
          path="/admin/story/update/:storyId"
          exact
          component={UpdateStory}
        ></AdminRoute>
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
        <Route path="*" exact component={PageNotFound}></Route>
      </Switch>
    </Router>
  );
};

export default Routes;
