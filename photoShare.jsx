import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch
} from 'react-router-dom';
import { Redirect } from 'react-router';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import LoginRegister from './components/loginRegister/LoginRegister';
import ActivityFeed from './components/activityFeed/ActivityFeed';

import './node_modules/materialize-css/dist/css/materialize.css';
import './styles/main.css';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: '', // id of user we are currently viewing (not necessarily the same as user logged in)
      inUserDetail: false,
      inUserPhotos: false,
      isLoggedIn: false,
      userLoggedIn: {first_name: "", last_name: ""}, // object for user who is logged in
      photoFile: '',
      comment: {}
    };
    
    this.handlerForContext = this.handlerForContext.bind(this);
    this.handlerForLogin = this.handlerForLogin.bind(this);
    this.handlerForAddPhoto = this.handlerForAddPhoto.bind(this);
    this.handlerForAddComment = this.handlerForAddComment.bind(this);
  }

  handlerForContext(newUserId, detailTruth, photosTruth) {
    this.setState({
      userId: newUserId,
      inUserDetail: detailTruth,
      inUserPhotos: photosTruth
    });
  }

  handlerForLogin(loginTruth, user) {
    this.setState({
      isLoggedIn: loginTruth,
      userId: user._id,
      userLoggedIn: user
    });
  }

  handlerForAddPhoto(photoFile) {
    this.setState({
      photoFile: photoFile
    });
  }

  handlerForAddComment(commentObj) {
    this.setState({
      comment: commentObj
    });
  }

  render() {
    return (
      <HashRouter>
      <div>
        <TopBar userId={this.state.userId} inUserDetail={this.state.inUserDetail} inUserPhotos={this.state.inUserPhotos}
          isLoggedIn={this.state.isLoggedIn} handlerForContext={this.handlerForContext} handlerForLogin={this.handlerForLogin}
          userLoggedIn={this.state.userLoggedIn} handlerForAddPhoto={this.handlerForAddPhoto}
        />
        <div className="row">
          <UserList isLoggedIn={this.state.isLoggedIn} userLoggedIn={this.state.userLoggedIn} photoFile={this.state.photoFile} comment={this.state.comment} />
          <div className="center-align">
            {
              this.state.isLoggedIn ?
                <Switch>
                  <Route path="/users/:userId"
                    render={ props => <UserDetail {...props} handlerForLogin={this.handlerForLogin} handlerForContext={this.handlerForContext} userLoggedIn={this.state.userLoggedIn} /> }
                  />
                  <Route path="/photos/:userId"
                    render={ props => <UserPhotos {...props} handlerForContext={this.handlerForContext} userLoggedIn={this.state.userLoggedIn}
                    handlerForAddComment={this.handlerForAddComment} handlerForAddPhoto={this.handlerForAddPhoto} /> }
                  />
                  <Route path="/users" component={UserList}  />
                  <Route path='/activity' component={ActivityFeed} />
                </Switch>
              :
                <Redirect to="/login-register" />
            }
            <Route path="/login-register"
              render={ props => <LoginRegister {...props} handlerForLogin={this.handlerForLogin} /> }
            />


          </div>
        </div>
      </div>
    </HashRouter>
    );
  }

}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);





