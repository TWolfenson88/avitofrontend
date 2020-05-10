import React from 'react';
import './UserCard.css'


export default class UserCard extends React.Component {
  render() {
    return (
      <div className="cardWrapper" onClick={()=>{this.props.setRecieverUsername(this.props.username)}}>
        {this.props.username}
        {(this.props.online) ? <div className="online" /> : <div className="offline" />}
      </div>
    )
  }
}