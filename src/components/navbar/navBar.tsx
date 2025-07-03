import { useState, useEffect } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography/Typography";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import AccountMenu from "@/components/accountMenu/accountMenu";
import CustomAvatarGroup from "@/components/customAvatarGroup/customAvatarGroup";

import { getSocket } from "@/hooks/socketClient";

import { RoomUsersType } from "@/types/commonTypes";

import "./navBar.scss";

export default function NavBar() {
  const [isCopied, setIsCopied] = useState(false);
  const [fetchedUsers, setFetchedUsers] = useState<RoomUsersType>([]);

  const userName = sessionStorage.getItem("user_name") || "guest";
  const roomId = sessionStorage.getItem("room_id") || "";

  useEffect(() => {
    // Connect to the NestJS WebSocket gateway
    const socket = getSocket();

    // Socket connection
    socket.on("connect", () => {
      console.log("in navbar Connected, joining room:", roomId);

      // Emit joinroom here too (same as in chatWindow)
      socket.emit("joinroom", {
        roomId,
        userName: userName,
      });
    });

    // Users in a room
    socket.on("users", (users: RoomUsersType) => {
      console.log("fetched users", users);
      setFetchedUsers(users);
    });

    return () => {
      socket.off("connect");
      socket.off("users");
    };
  }, []);

  return (
    <AppBar className="navbar">
      <Box className="user-profile-container">
        <AccountMenu />
        <h2 className="greeting-header">Welcome {userName + "!"}</h2>
      </Box>
      <Box className="room-id-container">
        <Typography variant="subtitle1">Room ID:</Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2">{roomId}</Typography>
          <Tooltip
            title={!isCopied ? "copy to clipboard" : "copied " + roomId}
            arrow
            slotProps={{ tooltip: { sx: { fontSize: "0.8rem" } } }}
          >
            <ContentCopyIcon
              className="copy-icon"
              onClick={() => {
                setIsCopied(true);
                navigator.clipboard.writeText(roomId);
              }}
            />
          </Tooltip>
        </Box>
      </Box>
      <Box className="custom-avatar-group-container">
        <CustomAvatarGroup fetchedUsers={fetchedUsers} />
      </Box>
    </AppBar>
  );
}
