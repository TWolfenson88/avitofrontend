import React from "react";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";

const customHistory = createBrowserHistory();

export default function RouterContainer() {
  return (
    <Router history={customHistory}>
      <Switch>
        <Route path='/' component={LoginPage} />
        <Route path='/register' component={RegisterPage} />
      </Switch>
	</Router>
  );
}
