import React from 'react';
import styles from './Conversation.css';

import nexmoClient from 'nexmo-client';

class Conversation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    
    this.createConversation = this.createConversation.bind(this);
    this.joinConversation = this.joinConversation.bind(this);
    this.enableAudio = this.enableAudio.bind(this);
    this.disableAudio = this.disableAudio.bind(this);
  }
  
  createConversation() {
    this.props.app.newConversation().then(conv => {
      conv.join().then(mem => {
        // user2 gets invited to everything to avoid having to paste around UUIDs
        conv.invite({id: 'USR-7355612d-b32b-4230-bcd8-8176e8e45a2a', user_name: 'user2'});
      });
      this.setState({
        conversation: conv
      });
    });
  }
  
  joinConversation(evt) {
    this.props.app.getConversation(evt.target.value).then(conv => {
      conv.join();
      this.setState({
        conversation: conv
      });
    });
  }
  
  enableAudio() {
    this.state.conversation.media.enable().then(stream => {
      // Older browsers may not have srcObject
      if ("srcObject" in this.audio) {
        this.audio.srcObject = stream;
      } else {
        // Avoid using this in new browsers, as it is going away.
        this.audio.src = window.URL.createObjectURL(stream);
      }

      this.audio.onloadedmetadata = () => {
        this.audio.play();
        this.setState({
          audioOn: true
        });
      }
    });
  }
  
  disableAudio() {
    this.state.conversation.media.disable().then(() => {
      this.setState({
        audioOn: false
      });
    });
  }
  
  render() {
    if (this.state.conversation) {
      // we already know the conversation to join
      return (
        <div className="conversation">
          <audio ref={el => (this.audio = el)}>
            <source/>
          </audio>
          <button onClick={this.enableAudio} disabled={this.state.audioOn}>Enable audio</button>
          <button onClick={this.disableAudio} disabled={!this.state.audioOn}>Disable audio</button>
        </div>
      );
    } else {
      let opts, key, buttons;
      if (this.props.invites) {
        opts = [<option key="0">-</option>];
        for (key in this.props.invites) {
          opts.push(<option key={this.props.invites[key].id} value={this.props.invites[key].id}>{this.props.invites[key].name}</option>);
        }
        buttons = (
          <label>Choose an active conversation: 
            <select onChange={evt => this.joinConversation(evt)}>
              {opts}
            </select> or
            <button onClick={this.createConversation} disabled={!this.props.loggedIn}>Start conversation</button>
          </label>
        );
      } else {
        buttons = <button onClick={this.createConversation} disabled={!this.props.loggedIn}>Start conversation</button>
      }
      // join or start a new conversation
      return (
        <div className="conversation">
          {buttons}
        </div>
      );
    }
  }
};

export default Conversation;