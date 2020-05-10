import React from 'react';
import UserCard from "../components/UserCard";
import callIcon from '../communications.svg';
import './Main.css'
import adapter from 'webrtc-adapter';
import { HOST as HOST, MEDIA_CONSTRAINTS as MEDIA_CONSTRAINTS } from '../constants'


const INSTANCE_MODES = { DEFAULT: 0, START_CALL: 1 }

var CONNECTION = new WebSocket(
      `ws://${HOST}:8080/ws`,
      "json");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms  ));
}

export default class MainPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {senderUsername: '', recieverUsername: '', username: props.username, targetUsername: '', flag: INSTANCE_MODES.DEFAULT};
    this.myPeerConnection = null;
    this.webcamStream = null;
    this.renderUserList = this.renderUserList.bind(this);
    this.setRecieverUsername = this.setRecieverUsername.bind(this);
    this.handleStartConnection = this.handleStartConnection.bind(this);
    this.call = this.call.bind(this);
    this.handleGetMessage = this.handleGetMessage.bind(this);
    this.handleVideoAnswerMsg = this.handleVideoAnswerMsg.bind(this);
    this.handleVideoOfferMsg = this.handleVideoOfferMsg.bind(this);
    this.handleNewICECandidateMsg = this.handleNewICECandidateMsg.bind(this);
    this.handleHangUpMsg = this.handleHangUpMsg.bind(this);
    this.closeVideoCall = this.closeVideoCall.bind(this);
    this.createPeerConnection = this.createPeerConnection.bind(this);
    this.handleICECandidateEvent = this.handleICECandidateEvent.bind(this);
    this.handleICEConnectionStateChangeEvent = this.handleICEConnectionStateChangeEvent.bind(this);
    this.handleICEGatheringStateChangeEvent = this.handleICEGatheringStateChangeEvent.bind(this);
    this.handleSignalingStateChangeEvent = this.handleSignalingStateChangeEvent.bind(this);
    this.handleNegotiationNeededEvent = this.handleNegotiationNeededEvent.bind(this);
    this.handleTrackEvent = this.handleTrackEvent.bind(this);
  }
  componentDidMount(){
    CONNECTION.onopen = this.handleStartConnection;
    CONNECTION.onmessage = this.handleGetMessage;
    this.handleStartConnection();
  }
  handleStartConnection(evt){
    CONNECTION.send(this.state.username);
    console.log('Connection success ', this.state.username);
  }
  async call(targetUsername) {
    //this.handleStartConnection();
    this.myPeerConnection = await this.createPeerConnection();
    console.log(targetUsername);
    this.setState({flag: INSTANCE_MODES.START_CALL, targetUsername: targetUsername});
    var transceiver;
    try {
      this.webcamStream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      document.getElementById("local_video").srcObject = this.webcamStream;
    } catch(err) {
      console.log(err);
      return;
    }
    try {
      this.webcamStream.getTracks().forEach(
        transceiver = track => this.myPeerConnection.addTransceiver(track, {streams: [this.webcamStream]})
      );
    } catch(err) {
      console.log(err);
    }
  }
  handleGetMessage(evt){
    console.log(evt.data);
    var data = evt.data.split('\n').forEach(el => {
      var msg = JSON.parse(atob(el));
      console.log('get message', msg);
      switch (msg.type) {
        case "video-offer":
          this.handleVideoOfferMsg(msg);
          break;
        case "video-answer":
          this.handleVideoAnswerMsg(msg);
          break;
        case "new-ice-candidate":
          this.handleNewICECandidateMsg(msg);
          break;
        case "hang-up":
          this.handleHangUpMsg(msg);
          break;
        default:
          console.log('Get msg', msg);
      }
    })
  }
  async handleVideoOfferMsg(msg) {
    console.log(msg);
    this.setState({
      flag: INSTANCE_MODES.START_CALL,
      senderUsername: msg.sender,
      recieverUsername: this.state.username,
      targetUsername: msg.sender
    });
    if (!this.myPeerConnection) {
      this.myPeerConnection = await this.createPeerConnection();
    }
    console.log("Received video chat offer from ", msg.sender);

    var desc = new RTCSessionDescription(msg.sdp);
    if (this.myPeerConnection.signalingState != "stable") {
      console.log("  - But the signaling state isn't stable, so triggering rollback");
      await Promise.all([
        this.myPeerConnection.setLocalDescription({type: "rollback"}),
        this.myPeerConnection.setRemoteDescription(desc)
      ]);
      return;
    } else {
      console.log("  - Setting remote description");
      await this.myPeerConnection.setRemoteDescription(desc);
    }
    if (!this.webcamStream) {
      try {
        this.webcamStream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
      } catch(err) {
        console.log(err);
        return;
      }
      document.getElementById("local_video").srcObject = this.webcamStream;
      try {
        var transceiver;
        this.webcamStream.getTracks().forEach(
          transceiver = track => this.myPeerConnection.addTransceiver(track, {streams: [this.webcamStream]})
        );
      } catch(err) {
        console.log(err);
      }
      await this.myPeerConnection.setLocalDescription(await this.myPeerConnection.createAnswer());
        sleep(2)
      let obg = btoa(JSON.stringify({
        type: "video-answer",
        sender: this.state.username,
        sdp: this.myPeerConnection.localDescription
      }));

      CONNECTION.send(JSON.stringify({receiver:  msg.sender, obj: obg}));
    }
  }
  async handleVideoAnswerMsg(msg) {
    console.log("*** Call recipient has accepted our call");

    var desc = new RTCSessionDescription(msg.sdp);
    await this.myPeerConnection.setRemoteDescription(desc).catch((err) => console.log(err));
  }
  async handleNewICECandidateMsg(msg) {
    var candidate = new RTCIceCandidate(msg.candidate);

    console.log("*** Adding received ICE candidate: " + JSON.stringify(candidate));
    console.log(this.myPeerConnection);
    try {
        sleep(2);
        await this.myPeerConnection.addIceCandidate(candidate);
        console.log(this.myPeerConnection);
    } catch(err) { console.log(err) }
  }
  handleHangUpMsg(msg) {
    console.log("*** Received hang up notification from other peer");
    this.closeVideoCall();
  }
  closeVideoCall() {
    var localVideo = document.getElementById("local_video");
    console.log("Closing the call");
    if (this.myPeerConnection) {
        console.log("--> Closing the peer connection");
        this.myPeerConnection.ontrack = null;
        this.myPeerConnection.onnicecandidate = null;
        this.myPeerConnection.oniceconnectionstatechange = null;
        this.myPeerConnection.onsignalingstatechange = null;
        this.myPeerConnection.onicegatheringstatechange = null;
        this.myPeerConnection.onnotificationneeded = null;

        this.myPeerConnection.getTransceivers().forEach(transceiver => {
            transceiver.stop();
        });

        if (localVideo.srcObject) {
            localVideo.pause();
            localVideo.srcObject.getTracks().forEach(track => {
                track.stop();
            });
        }

        this.myPeerConnection.close();
        this.myPeerConnection = null;
        this.webcamStream = null;
        this.setState({senderUsername: null, recieverUsername: null, targetUsername: null, flag: INSTANCE_MODES.DEFAULT});
    }
  }
  async createPeerConnection(){
    //if (this.myPeerConnection) return this.myPeerConnection;
    var myPeerConnection = new RTCPeerConnection({
        iceServers: [
            /*{
                urls: 'stun:84.201.128.121:3478'
            },*/
            {
                urls: 'stun:stun.l.google.com:19302'
            },
            {
                url: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            }
            /*{
                url: 'turn:192.158.29.39:3478?transport=udp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            },
            {
                url: 'turn:130.193.48.187:3478?transport=udp',
                credential: 'testpass',
                username: 'testuser'
            }*/
        ]
    });
    myPeerConnection.onicecandidate = this.handleICECandidateEvent;
    myPeerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
    myPeerConnection.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent;
    myPeerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent;
    myPeerConnection.ontrack = this.handleTrackEvent;
    return myPeerConnection
  }
  async handleICECandidateEvent(event){
    if (event.candidate) {
        console.log("*** Outgoing ICE candidate: " + event.candidate.candidate);
        //await sleep(2)
        let obg = btoa(JSON.stringify({
            type: "new-ice-candidate",
            candidate: event.candidate
        }));
        console.log('targetUsername', this.state.targetUsername);
        CONNECTION.send(JSON.stringify({receiver: this.state.targetUsername, obj: obg}));
    }
  }
  handleICEConnectionStateChangeEvent(event) {
    console.log("*** ICE connection state changed to ", this.myPeerConnection.iceConnectionState);

    switch(this.myPeerConnection.iceConnectionState) {
      case "closed":
      case "failed":
      case "disconnected":
        this.closeVideoCall();
        break;
    }
  }
  handleICEGatheringStateChangeEvent(event) {
    console.log("*** ICE gathering state changed to: " + this.myPeerConnection.iceGatheringState);
  }
  handleSignalingStateChangeEvent(event) {
    console.log("*** WebRTC signaling state changed to: ", this.myPeerConnection.signalingState);
    switch(this.myPeerConnection.signalingState) {
        case "closed":
            this.closeVideoCall();
            break;
    }
  }
  async handleNegotiationNeededEvent() {
    console.log("*** Negotiation needed");
    //this.handleStartConnection();
    console.log(this.myPeerConnection, this.state.username, this.state.targetUsername)
    try {
        console.log("---> Creating offer");
        const offer = await this.myPeerConnection.createOffer();
        sleep(2)
        if (this.myPeerConnection.signalingState != "stable") {
            console.log("     -- The connection isn't stable yet; postponing...");
            return;
        }

        console.log("---> Setting local description to the offer");
        await this.myPeerConnection.setLocalDescription(offer);

        console.log("---> Sending the offer to the remote peer");
        let obg = btoa(JSON.stringify({
            type: "video-offer",
            sender: this.state.username,
            sdp: this.myPeerConnection.localDescription
        }));
        CONNECTION.send(JSON.stringify({receiver:  this.state.targetUsername, obj: obg}));
    } catch(err) {
        console.log(err)
    };
  }
  handleTrackEvent(event) {
    console.log('***Track event***');
    console.log(document.getElementById("received_video"));
    document.getElementById("received_video").srcObject = event.streams[0];
  }
  setRecieverUsername(recieverUsername){
    console.log('recieverUsername', recieverUsername);
    this.setState({recieverUsername: recieverUsername});
  }
  renderUserList(){
    console.log(this.props.userList);
    return this.props.userList.map(user => {
      return (<UserCard username={user.name} online={user.online} key={user.uid} setRecieverUsername={this.setRecieverUsername}/>)
    })
  }
  render() {
    if (this.state.flag === INSTANCE_MODES.START_CALL) {
      return(
        <>
          <video id='received_video' width="300" height="300" autoPlay muted />
          <video id='local_video' width="120" height="120" autoPlay muted />
          <button onClick={this.closeVideoCall} className='endButton'> End </button>
        </>
      )
    }
    return(
      <div className="wrapper">
        <ul className='userList'>{this.renderUserList()}</ul>
        <div className="dialogWindow">
        {!(this.state.recieverUsername) ?
          <div className="dialogWindow">Выберете абонента</div>
          :
          <div className="companionWindow">{this.state.recieverUsername} <img src={callIcon} alt="logo" fill='#0BA808' height="32" onClick={() => this.call(this.state.recieverUsername)}/></div>}
        </div>
      </div>
    )
  }
}