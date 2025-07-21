import { useState, useEffect } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography/Typography";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import AccountMenu from "@/components/accountMenu/accountMenu";
import CustomAvatarGroup from "@/components/customAvatarGroup/customAvatarGroup";

import { getSocket } from "@/hooks/socketClient";
import { useAppSelector, useAppDispatch } from "@/hooks/storeHooks";
import {
  setUserName,
  setCurrentRoomId,
  setUserClientId,
} from "@/store/users/usersSlice";

import { RoomUsersType, UserSliceType } from "@/types/commonTypes";

import "./navBar.scss";

export default function NavBar() {
  const currentUser = useAppSelector((state) => state.user);

  const [isCopied, setIsCopied] = useState(false);
  const [fetchedUsers, setFetchedUsers] = useState<RoomUsersType>([]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    // Connect to the NestJS WebSocket gateway
    const socket = getSocket();

    // Socket connection
    socket.on("connect", () => {
      console.log("in navbar Connected, joining room:", currentUser.roomId);

      // Emit joinroom here too (same as in chatWindow)
      socket.emit("joinroom", {
        roomId: currentUser.roomId,
      });
    });

    // Users in a room
    socket.on("users", (users: RoomUsersType) => {
      console.log("fetched users", users);
      setFetchedUsers(users);
    });

    // User Info
    socket.on("user:info", (userInfo: UserSliceType) => {
      console.log("fetched user Info", userInfo);

      dispatch(setUserName({ name: userInfo.name }));
      dispatch(setCurrentRoomId({ roomId: userInfo.roomId }));
      dispatch(setUserClientId({ clientId: userInfo.clientId }));

      socket.off("user:info");
    });

    return () => {
      socket.off("connect");
      socket.off("users");
    };
  }, [currentUser.roomId, dispatch]);

  return (
    <AppBar className="navbar">
      <Box className="user-profile-container">
        <AccountMenu />
        <h2 className="greeting-header">Welcome {currentUser.name + "!"}</h2>
      </Box>
      <Box className="room-id-container">
        <Typography variant="subtitle1">Room ID:</Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2">{currentUser.roomId}</Typography>
          <Tooltip
            title={
              !isCopied ? "copy to clipboard" : "copied " + currentUser.roomId
            }
            arrow
            slotProps={{ tooltip: { sx: { fontSize: "0.8rem" } } }}
          >
            <ContentCopyIcon
              className="copy-icon"
              onClick={() => {
                setIsCopied(true);
                navigator.clipboard.writeText(currentUser.roomId);
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
