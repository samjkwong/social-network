import React from 'react';
import './userDetail.css';
import { Route } from "react-router-dom";
import { HashLink as Link } from 'react-router-hash-link';
import UserPhotos from '../userPhotos/UserPhotos';
import axios from 'axios';

class UserDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {first_name: "", last_name: ""},
      lastUpload: {}, // file name of last uploaded photo
      popularUpload: {}, // file name of photo with most comments
      warningPrompt: ''
    };

    this.handleDeleteAccount = this.handleDeleteAccount.bind(this);
    this.handleConfirmDeleteAccount = this.handleConfirmDeleteAccount.bind(this);
  }

  componentDidMount() {
    this.props.handlerForContext(this.props.match.params.userId, true, false);

    // fetch data for user
    axios.get("/user/" + this.props.match.params.userId)
      .then((responseData) => {
        this.setState({
          user: responseData.data
        });
      })
      .catch((error) => {
        console.log(error);
      });

    // fetch data for lastUpload
    axios.get("/lastUpload/" + this.props.match.params.userId)
      .then((responseData) => {
        this.setState({
          lastUpload: responseData.data
        });
      })
      .catch((error) => {
        console.log(error);
      });

    // fetch data for popularUpload
    axios.get("/popularUpload/" + this.props.match.params.userId)
      .then((responseData) => {
        this.setState({
          popularUpload: responseData.data
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.props.handlerForContext(this.props.match.params.userId, true, false);

      // fetch data for user
      var url = "/user/" + this.props.match.params.userId;
      axios.get(url)
        .then((responseData) => {
          this.setState({
            user: responseData.data
          });
        })
        .catch((error) => {
          console.log(error);
        });

      // fetch data for lastUpload
      axios.get("/lastUpload/" + this.props.match.params.userId)
        .then((responseData) => {
          this.setState({
            lastUpload: responseData.data
          });
        })
        .catch((error) => {
          console.log(error);
        });

      // fetch data for popularUpload
      axios.get("/popularUpload/" + this.props.match.params.userId)
        .then((responseData) => {
          this.setState({
            popularUpload: responseData.data
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  handleDeleteAccount(event) {
    event.preventDefault();
    this.setState({
      warningPrompt: <div>Are you sure? <button onClick={this.handleConfirmDeleteAccount}>[yes]</button></div>
    });
  }

  handleConfirmDeleteAccount(event) {
    event.preventDefault();
    axios.post('/removeUser/', {user: this.state.user})
      .then((responseData) => {
        console.log(responseData);
        this.props.handlerForLogin(false, '');
        this.props.handlerForContext('', false, false);
      })
      .catch((error) => {
        console.log(error);
      });  
  }

  render() {
    var commentsLength = 0;
    var deleteBtnHTML = '';
    if (this.state.user._id === this.props.userLoggedIn._id) {
      deleteBtnHTML = <div><button onClick={this.handleDeleteAccount}>[delete account]</button></div>;
    }
    if (this.state.popularUpload.comments) {
      commentsLength = this.state.popularUpload.comments.length;
    }
    return (
      <div className="left-align col s7">
      <div className="project-detail-username">{this.state.user.first_name} {this.state.user.last_name}</div>
        <ul className="collection">
          <li className="collection-item"><b>User ID:</b> {this.state.user._id}</li>
          <li className="collection-item"><b>Location:</b> {this.state.user.location}</li>
          <li className="collection-item"><b>Description:</b> {this.state.user.description}</li>
          <li className="collection-item"><b>Occupation:</b> {this.state.user.occupation}</li>
          <li className="collection-item">
            <b>Last Photo Upload:</b>
            <Link to={'/photos/'+this.state.user._id+'#'+this.state.lastUpload.file_name}>
              <img className='project-detail-thumbnail' src={'../../images/'+this.state.lastUpload.file_name} />
            </Link>
            <div><b>Date: </b>{this.state.lastUpload.date_time}</div>
          </li>
          <li className="collection-item">
            <b>Photo With Most Comments:</b>
            <Link to={'/photos/'+this.state.user._id+'#'+this.state.popularUpload.file_name}>
              <img className='project-detail-thumbnail' src={'../../images/'+this.state.popularUpload.file_name} />
            </Link>
            <div><b>Date: </b>{this.state.popularUpload.date_time}</div>
            <div><b>Number Of Comments: </b>{commentsLength}</div>
          </li>

        </ul>
        <Link to={"/photos/"+this.state.user._id} className="project-detail-photoslink">
          View Photos
        </Link>
        <Route path="/photos/:userId"
          render ={ props => <UserPhotos {...props} /> }
        />
        {deleteBtnHTML}
        {this.state.warningPrompt}
      </div>
    );
  }
}

export default UserDetail;


