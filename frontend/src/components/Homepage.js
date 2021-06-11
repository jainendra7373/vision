// https://www.techiediaries.com/django-react-forms-csrf-axios/
// see this site to understand csrf problems.

import React, { Component } from "react";
import RoomJoinPage from "./Roomjoinpage";
import CreateRoomPage from "./Createroompage";
import Room from "./Room";
import { Grid, Typography, Button, ButtonGroup } from "@material-ui/core";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: "",
      name: "jainenndra",
    };
    this.deleteRoom = this.deleteRoom.bind(this);
  }

  async componentDidMount() {
    fetch("/api/user-in-room")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.setState({
          roomCode: data.code,
        });
      })
      .catch((error) => {
        console.log("error in conponentDidMount");
      });
  }

  handelHomePage() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Typography component="h3" variant="h3">
            Home Party
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup disableElevation color="primary" variant="contained">
            <Button color="primary" to="/create" component={Link}>
              Create Room
            </Button>
            <Button color="secondary" to="/join" component={Link}>
              Join Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  }

  deleteRoom() {
    this.setState({
      roomCode: null,
    });
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() =>
              this.state.roomCode ? (
                <Redirect to={`/room/${this.state.roomCode}`} />
              ) : (
                this.handelHomePage()
              )
            }
          />
          <Route
            path="/room/:roomCode"
            render={(props) => {
              return <Room {...props} leaveTheRoom={this.deleteRoom} />;
            }}
          />
          <Route path="/join" component={RoomJoinPage} />
          <Route path="/create" component={CreateRoomPage} />
          <Route path="/room" component={Room} />
        </Switch>
      </Router>
    );
  }
}
