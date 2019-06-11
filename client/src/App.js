import React, { Component } from 'react';
import './App.css';
import Signup from './Signup';
import Login from './Login';
import UserProfile from './UserProfile';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      token: '',
      user: null,
      errorMessage: '',
      lockedResult: ''
    }
    this.liftTokenToState = this.liftTokenToState.bind(this)
    this.checkForLocalToken = this.checkForLocalToken.bind(this)
    this.logout = this.logout.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  checkForLocalToken() {
    // Look in localStorage for the token
    let token = localStorage.getItem('mernToken')
    if (!token || token === 'undefined') {
      // There is no token
      localStorage.removeItem('mernToken')
      this.setState({
        token: '',
        user: null
      })
    } else {
      // Found a token, send it to be verified
      axios.post('/auth/me/from/token', {token})
        .then( res => {
          if (res.data.type === 'error') {
            localStorage.removeItem('mernToken')
            this.setState({
              errorMessage: res.data.message
            })
          } else {
            // Put token in localStorage
            localStorage.setItem('mernToken', res.data.token)
            // Put token in state
            this.setState({
              token: res.data.token,
              user: res.data.user
            })
          }
        })
    }
  }

  componentDidMount() {
    this.checkForLocalToken()
  }

  liftTokenToState({token, user}) {
    this.setState({
      token,
      user
    })
  }

  logout() {
    // Remove the token from localStorage
    localStorage.removeItem('mernToken')
    // Remove the user and token from state
    this.setState({
      token: '',
      user: null
    })
  }

  handleClick(e) {
    e.preventDefault()
    // axios.defaults.headers.common['Authorization'] = `Bearer ${this.state.token}`
    let config = {
      headers: {
        Authorization: `Bearer ${this.state.token}`
      }
    }
    axios.get('/locked/test', config).then( res => {
      console.log("this is the locked response:", res)
      this.setState({
        lockedResult: res.data
      })
    })
  }

  render() {
    let user = this.state.user
    let contents;
    if (user) {
      contents = (
        <>
          <UserProfile user={user} logout={this.logout} />
          <p><a onClick={this.handleClick}>Test the protected route...</a></p>
          <p>{this.state.lockedResult}</p>
        </>
      )
    } else {
      contents = (
        <>
          <Signup liftToken={this.liftTokenToState} />
          <Login liftToken={this.liftTokenToState} />
        </>
      )
    }
    return (
      <div className="App">
        <header><h1>Welcome to my Site!</h1></header>
        <div className="content-box">
          {contents}
        </div>
      </div>
    );
  }
}

export default App;
