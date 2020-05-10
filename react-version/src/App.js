import React from 'react';
import avitoLogo from './avito-logo.svg';
import Header from "./components/Header";
import MainPage from "./pages/Main";
import './App.css';
import { HTTP_URL as HTTP_URL } from './constants'


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      uid: null,
      userList: [
        {"uid":3,"name":"Sergey","email":"","password":"","ident":"","online":true},
        {"uid":4,"name":"Kyle","email":"","password":"","ident":"","online":false},
        {"uid":5,"name":"Master","email":"","password":"","ident":"","online":false}
      ]
    }
    this.UserLogIn = this.UserLogIn.bind(this)
    this.UserRegister = this.UserRegister.bind(this)
    this.GetUserList = this.GetUserList.bind(this)
  }

  componentDidMount() {
    this.GetUserList().then((data) => {
      this.setState({userList: data})
      console.log(data)
    })
  }

  async GetUserList(){
    return await fetch(
      `${HTTP_URL}/users/all`,
      {
        method: 'get'
      }
    ).then(res=> res.json()).then((data) => {
      console.log('data', data.data);
      return data.data
    }).catch(err => {
      console.log(err)
    })
  }

  async UserLogIn(username, password) {
    console.log(username, password)
    return await fetch(
      `${HTTP_URL}/users/login`,
      {
        method: 'post',
        body: JSON.stringify({ name: username, password: password })
      }
    ).then(res=> res.json()).then((data) => {
      console.log('data', data);
      this.setState({username: username})
    }).catch(err => {
      console.log(err)
    })
  }
  async UserRegister(username, password) {

    console.log(username, password)
    return await fetch(
      `${HTTP_URL}/users/reg`,
      {
        method: 'post',
        body: JSON.stringify({ name: username, password: password })
      }
    ).then(res=> res.json()).then((data) => {
      console.log('data', data);
      this.setState({username: username})
    }).catch(err => {
      console.log(err)
    })
  }
  render(){
    return (
      <div className='PageWrapper'>
        <div className='Page'>
          <div className='Header'>
            <img src={avitoLogo} alt="logo" height="40"/>
            <div className='Title'> Звонки </div>
          </div>
          { !this.state.username ? <Header UserLogIn={this.UserLogIn} UserRegister={this.UserRegister} /> : <MainPage username={this.state.username} uid={this.state.uid} userList={this.state.userList}/> }
        </div>
      </div>
    );
  }
}

