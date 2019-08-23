import React from 'react';
import axios from 'axios';
import './LoginRegister.css';

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loginUsernameInput: '',
      loginPassInput: '',
      loginErrorMessage: '',
      registerUsernameInput: '',
      registerPassInput: '',
      registerPassReEnterInput: '',
      registerFirstNameInput: '',
      registerLastNameInput: '',
      registerLocationInput: '',
      registerDescriptionInput: '',
      registerOccupationInput: '',
      registerMessage: ''
    };

    this.handleLoginUsernameChange = this.handleLoginUsernameChange.bind(this);
    this.handleLoginPassChange = this.handleLoginPassChange.bind(this);
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleRegisterUsernameChange = this.handleRegisterUsernameChange.bind(this);
    this.handleRegisterPassChange = this.handleRegisterPassChange.bind(this);
    this.handleRegisterPassReEnterChange = this.handleRegisterPassReEnterChange.bind(this);
    this.handleRegisterFirstNameChange = this.handleRegisterFirstNameChange.bind(this);
    this.handleRegisterLastNameChange = this.handleRegisterLastNameChange.bind(this);
    this.handleRegisterLocationChange = this.handleRegisterLocationChange.bind(this);
    this.handleRegisterDescriptionChange = this.handleRegisterDescriptionChange.bind(this);
    this.handleRegisterOccupationChange = this.handleRegisterOccupationChange.bind(this);
    this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);

  }

  handleLoginUsernameChange(event) {
    this.setState({loginUsernameInput: event.target.value});
  }
  handleLoginPassChange(event) {
    this.setState({loginPassInput: event.target.value});
  }
  handleRegisterUsernameChange(event) {
    this.setState({registerUsernameInput: event.target.value.toLowerCase()});
  }
  handleRegisterPassChange(event) {
    this.setState({registerPassInput: event.target.value});
  }
  handleRegisterPassReEnterChange(event) {
    this.setState({registerPassReEnterInput: event.target.value});
  }
  handleRegisterFirstNameChange(event) {
    this.setState({registerFirstNameInput: event.target.value});
  }
  handleRegisterLastNameChange(event) {
    this.setState({registerLastNameInput: event.target.value});
  }
  handleRegisterLocationChange(event) {
    this.setState({registerLocationInput: event.target.value});
  }
  handleRegisterDescriptionChange(event) {
    this.setState({registerDescriptionInput: event.target.value});
  }
  handleRegisterOccupationChange(event) {
    this.setState({registerOccupationInput: event.target.value});
  }


  handleLoginSubmit(event) {
    event.preventDefault();
    var url = '/admin/login';
    axios.post(url, {login_name: this.state.loginUsernameInput, password: this.state.loginPassInput})
      .then((responseData) => {
        this.props.handlerForLogin(true, responseData.data);
        this.props.history.push('/users/' + responseData.data._id);
      })
      .catch((error) => {
        this.setState({
          loginErrorMessage: error.response.data
        });
      });
  }

  handleRegisterSubmit(event) {
    event.preventDefault();
    // check if passwords are the same
    if (this.state.registerPassInput !== this.state.registerPassReEnterInput) {
      console.log('Passwords do not match');
      this.setState({
        registerMessage: 'Passwords do not match'
      });
      return;
    }

    var url = '/user';
    axios.post(url, {
      login_name: this.state.registerUsernameInput,
      password: this.state.registerPassInput,
      first_name: this.state.registerFirstNameInput,
      last_name: this.state.registerLastNameInput,
      location: this.state.registerLocationInput,
      description: this.state.registerDescriptionInput,
      occupation: this.state.registerOccupationInput
    })
      .then((responseData) => {
        this.setState({
          registerUsernameInput: '',
          registerPassInput: '',
          registerPassReEnterInput: '',
          registerFirstNameInput: '',
          registerLastNameInput: '',
          registerLocationInput: '',
          registerDescriptionInput: '',
          registerOccupationInput: '',
          registerMessage: responseData.data
        });
      })
      .catch((error) => {
        console.log(error.response.data);
        this.setState({
          registerMessage: error.response.data
        });
      });
  }

  render() {
    return (
      <div>
        <form id='project-loginregister-loginform' onSubmit={this.handleLoginSubmit}>
          <div className='project-loginregister-title'>Username:</div>
          <input className='project-loginregister-input' type='text' onChange={this.handleLoginUsernameChange} />
          <div className='project-loginregister-title'>Password:</div>
          <input className='project-loginregister-input' type='password' onChange={this.handleLoginPassChange} />
          <input id='project-loginregister-loginsubmit' type='submit' value='Log In' />
        </form>
        <div id='project-loginregister-error'>{this.state.loginErrorMessage}</div>

        <div id='project-loginregister-createaccount'>Create a new account:</div>
        <form id='project-loginregister-registerform' onSubmit={this.handleRegisterSubmit}>
    
          <div className='project-loginregister-title'>Username:</div>
          <input className='project-loginregister-input' type='text' value={this.state.registerUsernameInput} onChange={this.handleRegisterUsernameChange} />

          <div className='project-loginregister-title'>Password:</div>
          <input className='project-loginregister-input' type='password' value={this.state.registerPassInput} onChange={this.handleRegisterPassChange} />

          <div className='project-loginregister-title'>Re-enter Password:</div>
          <input className='project-loginregister-input' type='password' value={this.state.registerPassReEnterInput} onChange={this.handleRegisterPassReEnterChange} />

          <div className='project-loginregister-title'>First Name:</div>
          <input className='project-loginregister-input' type='text' value={this.state.registerFirstNameInput} onChange={this.handleRegisterFirstNameChange} />

          <div className='project-loginregister-title'>Last Name:</div>
          <input className='project-loginregister-input' type='text' value={this.state.registerLastNameInput} onChange={this.handleRegisterLastNameChange} />

          <div className='project-loginregister-title'>Location:</div>
          <input className='project-loginregister-input' type='text' value={this.state.registerLocationInput} onChange={this.handleRegisterLocationChange} />

          <div className='project-loginregister-title'>Description:</div>
          <textarea className='project-loginregister-input' type='text' value={this.state.registerDescriptionInput} onChange={this.handleRegisterDescriptionChange} />

          <div className='project-loginregister-title'>Occupation:</div>
          <textarea className='project-loginregister-input' type='text' value={this.state.registerOccupationInput} onChange={this.handleRegisterOccupationChange} />

          <input id='project-loginregister-registersubmit' type='submit' value='Register Me' />
        </form>
        <div id='project-loginregister-registermessage'>{this.state.registerMessage}</div>
      </div>
    );
  }
}

export default LoginRegister;
