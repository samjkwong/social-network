import React from 'react';
import './userPhotos.css';
import UserDetail from '../userDetail/UserDetail';
import { Route, Link } from "react-router-dom";
import axios from 'axios';


class UserPhotos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      photos: [],
      input: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDeleteComment = this.handleDeleteComment.bind(this);
    this.handleDeletePhoto = this.handleDeletePhoto.bind(this);
  }

  componentDidMount() {
    this.props.handlerForContext(this.props.match.params.userId, false, true);

    var url = "/photosOfUser/" + this.props.match.params.userId;
    axios.get(url)
      .then((responseData) => {
        this.setState({
          photos: responseData.data
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.props.handlerForContext(this.props.match.params.userId, false, true);
      var url = "/photosOfUser/" + this.props.match.params.userId;
      axios.get(url)
        .then((responseData) => {
          this.setState({
            photos: responseData.data
          });
        })
        .catch((error) => {
          console.log(error);
        });
      }
  }

  handleChange(event) {
    this.setState({input: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    axios.post('/commentsOfPhoto/' + event.target.name, {comment: this.state.input})
      .then((responseData) => {
        console.log(responseData.data); // comment object
        this.props.handlerForAddComment(responseData.data);

        axios.get("/photosOfUser/" + this.props.match.params.userId)
          .then((responseData) => {

            this.setState({
              photos: responseData.data
            });
          })
          .catch((error) => {
            console.log(error.response.data);
          });

      })
      .catch((error) => {
        console.log(error);
        console.log(error.response.data);
      });
  }

  handleDeleteComment(event) {
    event.preventDefault();
    axios.post('/removeComment/'+event.target.name, {comment_id: event.target.value})
      .then((responseData) => {
        console.log(responseData.data);
        this.props.handlerForAddComment({});
        axios.get("/photosOfUser/" + this.props.match.params.userId)
          .then((responseData) => {

            this.setState({
              photos: responseData.data
            });
          })
          .catch((error) => {
            console.log(error.response.data);
          });

      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleDeletePhoto(event) {
    event.preventDefault();
    axios.post('/removePhoto/'+event.target.name, {})
      .then((responseData) => {
        console.log(responseData.data);
        this.props.handlerForAddPhoto('');
        axios.get("/photosOfUser/" + this.props.match.params.userId)
          .then((responseData) => {

            this.setState({
              photos: responseData.data
            });
          })
          .catch((error) => {
            console.log(error.response.data);
          });

      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    var initPhotos = []
    for (var photo of this.state.photos) {
      var photoHTML;
      var comments = photo.comments;
      var initComments = [];
      if (comments) {
        for (var c_obj of comments) {
          var commentHTML;
          var user = c_obj.user;
          if (user._id === this.props.userLoggedIn._id) {
            commentHTML =
              <div className="project-photos-comment" key={user+c_obj.date_time+c_obj.comment}>
                <Link to={"/users/"+user._id}>
                  {user.first_name} {user.last_name}
                </Link>: {c_obj.comment} <span className="project-photos-commentdate">({c_obj.date_time})</span>
                <Route path="/users/:userId"
                  render ={ props => <UserDetail {...props} /> }
                />
                <button className='project-photos-delete' name={photo._id} value={c_obj._id} onClick={this.handleDeleteComment}>[delete]</button>
              </div>;
          } else {
            commentHTML =
              <div className="project-photos-comment" key={user+c_obj.date_time+c_obj.comment}>
                <Link to={"/users/"+user._id}>
                  {user.first_name} {user.last_name}
                </Link>: {c_obj.comment} <span className="project-photos-commentdate">({c_obj.date_time})</span>
                <Route path="/users/:userId"
                  render ={ props => <UserDetail {...props} /> }
                />
              </div>;
          }
          initComments.push(commentHTML);
        }
      }

      if (photo.user_id === this.props.userLoggedIn._id) {
        photoHTML =
          <ul className="collection" key={photo.file_name}>
            <li className="collection-item">
              <img id={photo.file_name} src={"../../images/"+photo.file_name} />
              <div><button className='project-photos-delete' name={photo._id} onClick={this.handleDeletePhoto}>[delete]</button></div>
            </li>
            <li className="collection-item">
              <b>Date: </b>{photo["date_time"]}
            </li>
            <li className="collection-item">
              <div><b>Comments:</b></div>
              {initComments}
            </li>
            <li className="collection-item">
              <form id='project-photos-form' name={photo._id} onSubmit={this.handleSubmit}>
                <textarea id='project-photos-input' type='text' onChange={this.handleChange} />
                <input id='project-photos-submit' type='submit' value='Send' />
              </form>
            </li>
          </ul>;
      } else {
        photoHTML =
          <ul className="collection" key={photo.file_name}>
            <li className="collection-item">
              <img id={photo.file_name} src={"../../images/"+photo.file_name} />
            </li>
            <li className="collection-item">
              <b>Date: </b>{photo["date_time"]}
            </li>
            <li className="collection-item">
              <div><b>Comments:</b></div>
              {initComments}
            </li>
            <li className="collection-item">
              <form id='project-photos-form' name={photo._id} onSubmit={this.handleSubmit}>
                <textarea id='project-photos-input' type='text' onChange={this.handleChange} />
                <input id='project-photos-submit' type='submit' value='Send' />
              </form>
            </li>
          </ul>;
      }
      initPhotos.push(photoHTML);
    }

    return (
      <div className="left-align col s7">
        {initPhotos}
      </div>
    );
  }
}

export default UserPhotos;
