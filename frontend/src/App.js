import "./App.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import { useEffect, useRef, useState } from "react";

const socket = io.connect("http://localhost:5000");

function App() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [recivingcall, setRecevingCal] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    //helps to popup the allow camera and mic option
    // navigator.mediaDevices
    //   .getUserMedia({ video: true, audio: true })
    //   .then((stream) => {
    //     setStream(stream);
    //     myVideo.current.srcObject = stream;
    //   });
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setRecevingCal(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);

  //creating the peer
  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  return (
    <div className="App">
      <h1> callme</h1>
      <div>
        <div>
          {stream && (
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              style={{ width: "300px" }}
            ></video>
          )}
        </div>
        <div>
          {callAccepted && !callEnded ? (
            <video
              playsInline
              ref={userVideo}
              autoPlay
              style={{ width: "300px" }}
            ></video>
          ) : null}
        </div>
      </div>
      {/* call information */}
      <div>
        <input
          placeholder="Entername"
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></input>
        <CopyToClipboard text={me}>
          <button>Copy ID</button>
        </CopyToClipboard>

        <input
          value={idToCall}
          onChange={(e) => setIdToCall(e.target.value)}
        ></input>
      </div>
      <div>
        {callAccepted && !callEnded ? (
          <button onClick={leaveCall}>End call</button>
        ) : (
          <button onClick={() => callUser(idToCall)}> Call</button>
        )}
        {idToCall}
      </div>
      <div>
        {recivingcall && !callAccepted ? (
          <div>
            <h1>{name} is calling...</h1>
            <button onClick={answerCall}>Answer</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
