import React from 'react';

const UserProfile = props => {
  return (
    <div className="UserProfile">
      <p>Hello, {props.user.name}</p>
      <a onClick={props.logout}>Log Out!</a>
    </div>
  )
}

export default UserProfile;
