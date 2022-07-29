import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Heading, Text, Textarea } from "@chakra-ui/react";
import { MdOutlineContentCopy } from "react-icons/md";
import styles from "./navbar.module.css";
import { MdCall, MdCallEnd } from "react-icons/md";


const socket = io.connect("http://localhost:5000");

export const Vedio = () => {
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
    <Flex gap={"2vw"}>
      <Box textAlign={"center"} w={"78vw"}>
        <Heading as="h3" size="lg" mt={"35px"} mb="20px">
          Chit Chat
        </Heading>
        <Flex
          direction={["column", "column", "column", "row"]}
          align={"center"}
          gap={"7px"}
          margin="auto"
          justifyContent={"center"}
        >
          <Box>
            {stream && (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "36vw" }}
              ></video>
            )}
          </Box>
          <Box>
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "36vw" }}
              ></video>
            ) : null}
          </Box>
        </Flex>
      </Box>

      {/* call information */}
      <Flex
        direction={"column"}
        w={"20vw"}
        align={"left"}
        margin={"auto"}
        gap={"10px"}
        fontSize={"17px"}
        fontWeight={"bold"}
        padding={"15px"}
        className={styles.main}
      >
        <Box>
          <Text mb="8px">Enter Your Name</Text>
          <Textarea
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="enter your name"
            size="sm"
          />
        </Box>

        <CopyToClipboard text={me}>
          <Button
            rightIcon={<MdOutlineContentCopy />}
            colorScheme="teal"
            variant="outline"
          >
            Copy ID
          </Button>
        </CopyToClipboard>

        <Box>
          <Text mb="8px">Enter caller ID</Text>
          <Textarea
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
            placeholder="enter your name"
            size="sm"
          />
        </Box>

        <div>
          {idToCall && (
            <Text>
              Calling..<br></br> {idToCall}
            </Text>
          )}
          {callAccepted && !callEnded ? (
            <Button
              onClick={leaveCall}
              rightIcon={<MdCallEnd />}
              colorScheme="red"
              variant="solid"
              color={"blue"}
              fontSize={"21px"}
              width={"100%"}
            ></Button>
          ) : (
            // <button onClick={leaveCall}>End call</button>
            <Button
              onClick={() => callUser(idToCall)}
              rightIcon={<MdCall />}
              colorScheme="green"
              variant="solid"
              color={"blue"}
              fontSize={"21px"}
              width={"100%"}
            ></Button>
            // <button onClick={() => callUser(idToCall)}> Call</button>
          )}
        </div>
        <div>
          {recivingcall && !callAccepted ? (
            <Flex direction={"column"}>
              <Text color={"green"}>{name} is calling...</Text>
              <Flex>
                <Button
                  onClick={answerCall}
                  rightIcon={<MdCall />}
                  colorScheme="green"
                  variant="solid"
                  color={"blue"}
                  fontSize={"21px"}
                  width={"100%"}
                ></Button>
                <Button
                  onClick={leaveCall}
                  rightIcon={<MdCallEnd />}
                  colorScheme="red"
                  variant="solid"
                  color={"blue"}
                  fontSize={"21px"}
                  width={"100%"}
                ></Button>
              </Flex>

              {/* <button onClick={answerCall}>Answer</button> */}
            </Flex>
          ) : null}
        </div>
      </Flex>
    </Flex>
  );
};
