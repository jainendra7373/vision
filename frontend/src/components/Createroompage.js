import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Link } from "react-router-dom";
import { Collapse } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import Cookies from "js-cookie"; //https://docs.djangoproject.com/en/dev/ref/csrf/#ajax

export default class CreateRoomPage extends Component {
  static defaultProps = {
    update: false,
    guest_can_pause: true,
    votes_to_skip: 2,
    roomCode: null,
    updateCallback: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      guest_can_pause: this.props.guest_can_pause,
      votes_to_skip: this.props.votes_to_skip,
      errorMsg: "",
      successMsg: "",
    };
    this.handleGuestCanPause = this.handleGuestCanPause.bind(this);
    this.handleVotesToSkip = this.handleVotesToSkip.bind(this);
    this.handleRoomButtonPress = this.handleRoomButtonPress.bind(this);
    this.handleRoomUpdateButtonPress =
      this.handleRoomUpdateButtonPress.bind(this);
  }

  handleGuestCanPause(e) {
    this.setState({
      guest_can_pause: e.target.value === "true" ? true : false,
    });
  }

  handleVotesToSkip(e) {
    this.setState({
      votes_to_skip: e.target.value,
    });
  }

  handleRoomButtonPress() {
    const csrftoken = Cookies.get("csrftoken");
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({
        votes_to_skip: this.state.votes_to_skip,
        guest_can_pause: this.state.guest_can_pause,
      }),
    };
    fetch("/api/create-room", requestOptions)
      .then((response) => response.json())
      .then((data) => this.props.history.push("/room/" + data.code));
  }

  handleRoomUpdateButtonPress() {
    const csrftoken = Cookies.get("csrftoken");
    const requestOptions = {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
      body: JSON.stringify({
        votes_to_skip: this.state.votes_to_skip,
        guest_can_pause: this.state.guest_can_pause,
        code: this.props.roomCode,
      }),
    };
    fetch("/api/update-room", requestOptions).then((response) => {
      if (response.ok) {
        this.setState({
          successMsg: "Room Updated successfully",
        });
      } else {
        this.setState({
          errorMsg: "Error in updating room ....",
        });
      }
      this.props.updateCallback();
    });
  }

  updateRoom() {
    return (
      <Grid item xs={12} align="center">
        <Button
          color="primary"
          variant="contained"
          onClick={this.handleRoomUpdateButtonPress}
        >
          Update Room
        </Button>
      </Grid>
    );
  }

  createNewRoom() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleRoomButtonPress}
          >
            Create A room
          </Button>
        </Grid>
        <Grid item xs={12} align="center">
          <Button color="secondary" variant="contained" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }

  render() {
    const title = this.props.update ? "Update Room" : "Create New Room";
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Collapse
            in={this.state.errorMsg != "" || this.state.successMsg != ""}
          >
            {this.state.successMsg != "" ? (
              <Alert
                severity="success"
                onClose={() => {
                  this.setState({ successMsg: "" });
                }}
              >
                {this.state.successMsg}
              </Alert>
            ) : (
              <Alert
                severity="error"
                onClose={() => {
                  this.setState({ errorMsg: "" });
                }}
              >
                {this.state.errorMsg}
              </Alert>
            )}
          </Collapse>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography component="h4" variant="h4">
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <FormControl component="fieldset">
            <div align="center">
              <FormHelperText>
                This is create room page to create a room
              </FormHelperText>
            </div>
            <RadioGroup
              row
              defaultValue={this.props.guest_can_pause.toString()}
              onClick={this.handleGuestCanPause}
            >
              <FormControlLabel
                value="true"
                labelPlacement="bottom"
                control={<Radio color="primary" />}
                label="Play/Pause"
              />

              <FormControlLabel
                value="False"
                labelPlacement="bottom"
                control={<Radio color="secondary" />}
                label="No Control"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} align="center">
          <FormControl>
            <TextField
              required={true}
              defaultValue={this.props.votes_to_skip}
              type="number"
              inputProps={{
                min: 1,
                style: { textAlign: "center" },
              }}
              onClick={this.handleVotesToSkip}
            />
            <div align="center">
              <FormHelperText>Votes Required To Skip A Song</FormHelperText>
            </div>
          </FormControl>
        </Grid>
        {this.props.update ? this.updateRoom() : this.createNewRoom()}
      </Grid>
    );
  }
}
