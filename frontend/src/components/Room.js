import React, { Component } from "react";
import { Grid, Typography, Button } from "@material-ui/core";
import Cookies from "js-cookie";
import CreateRoomPage from "./Createroompage";

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      guestCanPause: false,
      votesToSkip: 2,
      isHost: false,
      showSettings: false,
      isSpotifyAuthenticated: false,
    };
    this.roomCode = this.props.match.params.roomCode;

    this.getRoomDetails = this.getRoomDetails.bind(this);

    this.leaveRoom = this.leaveRoom.bind(this);
    this.updateShowSettings = this.updateShowSettings.bind(this);
    this.displaySettings = this.displaySettings.bind(this);
    this.renderUpdateSettings = this.renderUpdateSettings.bind(this);
    this.isUserAuthenticated = this.isUserAuthenticated.bind(this);
    this.getRoomDetails();
  }

  getRoomDetails() {
    fetch("/api/get-room" + "?code=" + this.roomCode)
      .then((response) => {
        if (response.ok) return response.json();
        else {
          this.props.leaveTheRoom();
          this.props.history.push("/");
        }
      })
      .then((data) => {
        this.setState({
          guestCanPause: data.guest_can_pause,
          votesToSkip: data.votes_to_skip,
          isHost: data.is_host,
        });
        if (this.state.isHost) this.isUserAuthenticated();
      })
      .catch((error) => console.log(error + "This error in file"));
  }

  isUserAuthenticated() {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ isSpotifyAuthenticated: data.status });
        console.log(data.status); ////////////////////////////////////////////////
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.href = data.url;
              //              window.location.replace(data.url);
            });
        }
      });
  }

  leaveRoom() {
    const csrftoken = Cookies.get("csrftoken");
    const postContents = {
      method: "POST",
      header: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: {},
    };
    fetch("/api/leave-room", postContents).then((response) => {
      this.props.leaveTheRoom();
      this.props.history.push("/");
    });
  }

  updateShowSettings(value) {
    this.setState({
      showSettings: value,
    });
  }

  renderUpdateSettings() {
    return (
      <Grid container spacing={1}>
        <Grid item align="center" xs={12}>
          <CreateRoomPage
            update={true}
            guestCanPause={this.state.guestCanPause}
            votesToSkip={this.state.votesToSkip}
            roomCode={this.roomCode}
            updateCallback={this.getRoomDetails}
          />
        </Grid>
        <Grid align="center" xs={12} item>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => this.updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  displaySettings() {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  }

  render() {
    if (this.state.showSettings) {
      return this.renderUpdateSettings();
    }
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography component="h4" variant="h4">
            {this.roomCode}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Votes: {this.state.votesToSkip}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Guest Can Pause: {this.state.guestCanPause.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Is Host: {this.state.isHost.toString()}
          </Typography>
        </Grid>
        {this.state.isHost ? this.displaySettings() : null}
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={this.leaveRoom}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>
    );
  }
}

/*  */
