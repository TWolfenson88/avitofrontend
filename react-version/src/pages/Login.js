import React from 'react';
import './Login.css'


export default class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {username: '', password: ''}
    this.submitForm = this.submitForm.bind(this)
  }
  submitForm(){
    console.log(this.state.username, this.state.password);
    this.props.UserLogIn(this.state.username, this.state.password)
  }
  render() {
    return (
      <div className='LoginForm'>
        <input placeholder='Введите логин' value={this.state.username} onChange={ (e) => this.setState({username: e.target.value}) } />
        <input placeholder='Введите пароль' type='password' value={this.state.password} onChange={(e) => this.setState({password: e.target.value})} />
        <button onClick={this.submitForm}> Войти </button>
      </div>
    )
  }
}