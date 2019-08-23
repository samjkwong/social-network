import React from 'react';
import './userList.css';
import { HashLink as Link } from 'react-router-hash-link';
import axios from 'axios';

class UserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
    };
  }

  componentDidMount() {
    var url = "/user/list";
    axios.get(url)
      .then((responseData) => {
        this.setState({
          users: responseData.data
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidUpdate(prevProps) {
    if (this.props.isLoggedIn !== prevProps.isLoggedIn
      || this.props.photoFile !== prevProps.photoFile
      || this.props.comment !== prevProps.comment) {
      // fetch data
      var url = "/user/list";
      axios.get(url)
        .then((responseData) => {
          this.setState({
            users: responseData.data
          });
        })
        .catch((error) => {
          console.log(error);
          this.setState({
            users: []
          });
        });
    }
  }

  render() {
    var initUser = [];
    var initFriends = [];

    if (this.props.isLoggedIn) {
      initUser.push(
        <li className="collection-item project-userlist-title" key='title'>
          Logged in as:
        </li>);
      initFriends.push(
        <li className="collection-item project-userlist-title" key='title'>
          Friends:
        </li>);

      for (var user of this.state.users) {
        var entryHTML;
        if (!user.activity) {
          entryHTML = 
            <li className="collection-item" key={user._id}>
              <Link to={"/users/"+user._id}>
                {user.first_name} {user.last_name}
              </Link>
              <div>
                <i>no recent activity</i>
              </div>
            </li>;
        } else if (user.activity.type === 'photo') {
          entryHTML = 
            <li className="collection-item" key={user._id}>
              <Link to={"/users/"+user._id}>
                {user.first_name} {user.last_name}
              </Link>
              <div>
                <i>posted a photo</i>
                <Link to={'/photos/'+user.activity.photo_owner_id+'#'+user.activity.file_name}>
                  <img className='project-userlist-thumbnail' src={'../../images/'+user.activity.file_name} />
                </Link>
              </div>
            </li>;
        } else if (user.activity.type === 'comment') {
          entryHTML = 
            <li className="collection-item" key={user._id}>
              <Link to={"/users/"+user._id}>
                {user.first_name} {user.last_name}
              </Link>
              <div>
                <i>added a comment</i>
              </div>
            </li>;
        } else if (user.activity.type === 'registration') {
          entryHTML = 
            <li className="collection-item" key={user._id}>
              <Link to={"/users/"+user._id}>
                {user.first_name} {user.last_name}
              </Link>
              <div>
                <i>registered as a user</i>
              </div>
            </li>;
        } else if (user.activity.type === 'login') {
          entryHTML = 
            <li className="collection-item" key={user._id}>
              <Link to={"/users/"+user._id}>
                {user.first_name} {user.last_name}
              </Link>
              <div>
                <i>logged in</i>
              </div>
            </li>;
        } else { // logout
          entryHTML = 
            <li className="collection-item" key={user._id}>
              <Link to={"/users/"+user._id}>
                {user.first_name} {user.last_name}
              </Link>
              <div>
                <i>logged out</i>
              </div>
            </li>;
        }

        if (user._id === this.props.userLoggedIn._id) {
          initUser.push(entryHTML);
        } else {
          initFriends.push(entryHTML);
        }
      }
    }

    return (
      <div className="userlist collection col s4 z-depth-2">
        <ul> 
          {initUser}
        </ul>
        <ul>
          {initFriends}
        </ul>
      </div>
    );
  }
}

export default UserList;
