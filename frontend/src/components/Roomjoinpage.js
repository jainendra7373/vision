import React, {Component} from "react";
import {Link} from "react-router-dom";
import { TextField, Button, Typography, Grid } from "@material-ui/core";

export default class RoomJoinPage extends Component {
    constructor(props){
        super(props);
        this.state={
            errorMessage:"",
            roomCode:"",
        }
        this.handleRoomCode=this.handleRoomCode.bind(this);
        this.handleButtonPressed=this.handleButtonPressed.bind(this);
    }
    
    render() {
        return (
            <Grid container spacing={2}>
                <Grid xs={12} item align="center">
                    <Typography variant="h4" component="h4">
                        Join The Room
                    </Typography>
                </Grid>
                <Grid xs={12} item align="center">
                    <TextField
                        error={this.state.errorMessage.length>0}
                        variant="outlined"
                        placeholder="Enter a Room code"
                        label="Code"
                        helperText={this.state.errorMessage}
                        value={this.state.roomCode}
                        onChange={this.handleRoomCode}
                    />
                </Grid>
                <Grid xs={12} item align="center">
                    <Button variant="contained" color="primary" onClick={this.handleButtonPressed}>
                        Join Room
                    </Button>
                </Grid>
                <Grid xs={12} item align="center">
                    <Button variant="contained" color="secondary" to="/" component={Link}>
                        Back
                    </Button>
                </Grid>
            </Grid>
        )
    }
    handleRoomCode(e){
        this.setState({
            roomCode:e.target.value
        });
    }

    handleButtonPressed(){
        const requestOptions={
            method:'post',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                code:this.state.roomCode,
            })
        };
        fetch('/api/join-room',requestOptions).then((response)=>{
            if(response.ok)
                this.props.history.push(`/room/${this.state.roomCode}`);
            else
                this.setState({
                    errorMessage:"Room not found"
                })
        }).catch((error)=>{
            console.log(error)
        })                 
    }
}