import { Button, Flex, Stack } from "@chakra-ui/react";
import React from "react";
import { IoMdVideocam } from "react-icons/io";
import { HiChatAlt2 } from "react-icons/hi";
import { Link } from "react-router-dom";
import styles from "./navbar.module.css"

export const Navbar = () => {
  return (
    <Flex justifyContent={"space-between"} align={"center"} padding={"0 15px"} className={styles.main} >
      <img src="./chit-chat-logo.jpg" style={{ width: "15%" }}></img>
      <Stack direction="row" spacing={4}>
        <Link to="/">
          <Button
            leftIcon={<HiChatAlt2 fontSize={"22px"} />}
            colorScheme="teal"
            variant="outline"
          >
            Text
          </Button>
        </Link>
        <Link to="/vedio">
          <Button
            rightIcon={<IoMdVideocam fontSize={"22px"} />}
            colorScheme="teal"
            variant="outline"
          >
            Call
          </Button>
        </Link>
      </Stack>
    </Flex>
  );
};
