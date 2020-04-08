import React from 'react';
import styles from './User.css';

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUsers: []
    };
    
    this.getUsers = this.getUsers.bind(this);
    this.setExistingUser = this.setExistingUser.bind(this);
    this.createUser = this.createUser.bind(this);
    
    this.getUsers();
  };
  
  getUsers() {
    fetch('/getUsers', {
      method: 'GET'
    }).then(results => results.json())
    .then(data => {
      this.setState({
        currentUsers: data.users
      });
    });
  }
  
  setExistingUser(evt) {
    this.setState({
      username: evt.target[evt.target.selectedIndex].text,
      userId: evt.target.value
    }, () => this.props.onUpdate(this.state));
  }
  
  createUser() {
    fetch('/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.state.username
      })
    }).then(results => results.json())
      .then(data => { 
        this.setState({
          userId: data.id
        }, () => this.props.onUpdate(this.state));
      });
  }
  
  setUsername(evt) {
    this.setState({
      username: evt.target.value
    });
  }
  
  render() {
    if (this.state.userId) {
      // user is logged in
      return (
        <div className="userinfo userconnected">
          Connected as <span className={styles.username}>{this.state.username}</span>
        </div>
      );
    } else {
      // we need to create a user
      return (
        <div className="userinfo">
          <label>User name: 
            <select onChange={evt => this.setExistingUser(evt)}>
              <option value=""></option>
              {this.state.currentUsers.map(item => {
                return <option key={item.id} value={item.id}>{item.name}</option>
              })}
            </select>
          </label>
          <input type="text" onChange={evt => this.setUsername(evt)} />
          <button onClick={this.createUser}>Create user</button>
        </div>
      );
    }
  }
};

export default User;