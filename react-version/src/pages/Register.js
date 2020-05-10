import React from 'react';
import './Login.css'

export default class RegisterPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {username: '', password: '', confirmedPassword: ''}
    this.submitForm = this.submitForm.bind(this)
  }
  submitForm(){
    console.log(this.state.username, this.state.password)
    this.props.UserRegister(this.state.username, this.state.password)
  }
  render() {
    return (
      <div className='LoginForm'>
        <input placeholder='Введите логин' value={this.state.username} onChange={ (e) => this.setState({username: e.target.value}) } />
        <input placeholder='Введите пароль' type='password' value={this.state.password} onChange={(e) => this.setState({password: e.target.value})} />
        <input placeholder='Подтвердите пароль' type='password' value={this.state.confirmedPassword} onChange={(e) => this.setState({confirmedPassword: e.target.value})} />
        <button onClick={this.submitForm}> Зарегестрироваться </button>
      </div>
    )
  }
}