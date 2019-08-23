import React from 'react';
import './TopBar.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

class TopBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userViewed: {first_name: "", last_name: ""}, // user who's profile is being viewed
      userLoggedIn: {first_name: "", last_name: ""}
    }

    this.handleAddPhoto = this.handleAddPhoto.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.userId !== prevProps.userId && this.props.userLoggedIn) {
      
      // fetch data for viewing status
      var url = "/user/" + this.props.userId;
      axios.get(url)
        .then((responseData) => {
          this.setState({
            userViewed: responseData.data,
          });
        })
        .catch((error) => {
          console.log(error);
          this.setState({
            userViewed: {first_name: "", last_name: ""}
          });
        });
    }

    if (this.props.userLoggedIn !== prevProps.userLoggedIn) {
      this.setState({
        userLoggedIn: this.props.userLoggedIn
      });
    }
  }

  handleAddPhoto(event) {
    event.preventDefault();
    var url = '/photos/new';
    // Create a DOM form and add the file to it under the name uploadedphoto
    const domForm = new FormData();
    domForm.append('uploadedphoto', this.uploadInput.files[0]);
    
    axios.post(url, domForm)
      .then((responseData) => {
        console.log(responseData.data); // printing newPhoto
        this.props.handlerForAddPhoto(domForm);
      })
      .catch((error) => {
        console.log(error);
        console.log(error.response.data);
      });
  }

  handleLogout(event) {
    event.preventDefault();
    var url = '/admin/logout';
    axios.post(url, {})
      .then((responseData) => {
        console.log(responseData.data);
        this.props.handlerForLogin(false, '');
        this.props.handlerForContext('', false, false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    var context = '';
    var welcomeMsg;
    var activitiesLinkHTML;
    var logoutBtnHTML;
    var addPhotoSelectHTML;
    var addPhotoBtnHTML;
    if (this.props.inUserDetail && !this.props.inUserPhotos) {
      context += this.state.userViewed.first_name + " " + this.state.userViewed.last_name;
    } else if (!this.props.inUserDetail && this.props.inUserPhotos) {
      context += this.state.userViewed.first_name + " " + this.state.userViewed.last_name + "'s Photos";
    }

    if (this.props.isLoggedIn) {
      welcomeMsg = 'Hi ' + this.state.userLoggedIn.first_name;
      activitiesLinkHTML = <Link to={'/activity'} className='project-topbar-activitieslink'>Activities</Link>;
      addPhotoSelectHTML = <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />;
      addPhotoBtnHTML = <button className='project-topbar-btn' onClick={this.handleAddPhoto}>Add Photo</button>;
      logoutBtnHTML = <button className='project-topbar-btn' onClick={this.handleLogout}>Log Out</button>;
    } else {
      welcomeMsg = 'Please Login';
    }

    return (
      <nav>
        <div id='project-topbar-container'>
          <div id='project-topbar-welcome'>{welcomeMsg}</div>
          <div id='project-topbar-feed'>{activitiesLinkHTML}</div>
          <div id='project-topbar-context'>{context}</div>
          <div>
            <div id='project-topbar-addphoto'>{addPhotoSelectHTML}{addPhotoBtnHTML}</div>
            <div id='project-topbar-logout'>{logoutBtnHTML}</div>
          </div>
        </div>
      </nav>
    );
  }
}

export default TopBar;
