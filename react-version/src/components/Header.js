import React from 'react';
import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Register";
import './Header.css'
import { BrowserRouter as Router, Route, Switch, NavLink } from "react-router-dom";
import { createBrowserHistory } from "history";

const customHistory = createBrowserHistory();

export default class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Router history={customHistory}>
        <div className='TopMenu'>
          <NavLink to='/'> Вход </NavLink>
          <NavLink to='/register'> Регистрация </NavLink>
        </div>
        <Switch>
          <Route path="/register">
            <RegisterPage UserRegister={this.props.UserRegister}/>
          </Route>
          <Route path='/'>
            <LoginPage UserLogIn={this.props.UserLogIn} />
          </Route>
        </Switch>
      </Router>
    )
  }
}
