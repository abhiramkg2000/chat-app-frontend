import { ChangeEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import SnackBar from "@/components/snackbar/snackbar";

import {
  ROOM_ID_REGEX,
  USER_NAME_REGEX,
  USER_PASSWORD_REGEX,
} from "@/constants/commonConstants";

import "./loginForm.scss";

export default function LoginForm() {
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isValidRoom, setIsValidRoom] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [touched, setTouched] = useState({
    username: false,
    password: false,
    roomId: false,
  });

  const router = useRouter();

  const handleRoomGeneration = () => {
    const unique_Id = uuidv4();
    setRoomId(unique_Id);
    sessionStorage.setItem("room_id", unique_Id);
  };

  const handleRoomJoin = () => {
    validateUserCredentials();
  };

  const handleUserNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUserName(value);
  };

  const handleUserPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUserPassword(value);
  };

  const handleRoomIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const validateRoomId = async () => {
    try {
      const res = await fetch("http://localhost:3001/rooms", {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = await res.json();
      const rooms: string[] = data.rooms;
      console.log("room id:", roomId, "rooms:", data);

      if (rooms.find((id) => id === roomId)) {
        console.log("room exists in backend");
        setSnackbarOpen(true);
        setIsValidRoom(true);
      } else if (roomId === sessionStorage.getItem("room_id")) {
        console.log("room is a generated one");
        setSnackbarOpen(true);
        setIsValidRoom(true);
      } else {
        console.log("no such room exists");
        setSnackbarOpen(true);
        setSnackbarMessage(
          "No such room exists, please check the room id or generate a new one"
        );
        setIsValidRoom(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const validateUserCredentials = async () => {
    try {
      const res = await fetch("http://localhost:3001/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          name: userName,
          password: userPassword,
        }),
      });

      const data = await res.json();
      console.log("data", data);

      setSnackbarMessage(data.message);

      if (data.validUserName && data.validUserPassword) {
        validateRoomId();
      } else {
        setSnackbarOpen(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (isValidRoom) {
      if (!userName) {
        setUserName("guest");
      }

      sessionStorage.setItem("room_id", roomId);
      sessionStorage.setItem("user_name", userName);

      setUserName("");
      setUserPassword("");
      setRoomId("");

      setTouched({
        username: false,
        password: false,
        roomId: false,
      });

      setTimeout(() => {
        router.push("/chats");
      }, 1000);
    }
  }, [isValidRoom]);

  return (
    <>
      <Box className="login-page">
        <Card className="login-card">
          <CardContent className="login-card-content">
            <TextField
              className="user-name-input"
              name="user Name"
              label="User Name"
              value={userName}
              // autoComplete="off"
              variant="outlined"
              onChange={handleUserNameChange}
              onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
              error={touched.username && !USER_NAME_REGEX.test(userName)}
              helperText={
                touched.username && !USER_NAME_REGEX.test(userName)
                  ? "username can contain only letters, digits and underscore"
                  : ""
              }
              required
            />
            <TextField
              className="password-input"
              name="Password"
              // type="password"
              label="Password"
              value={userPassword}
              autoComplete="off"
              variant="outlined"
              onChange={handleUserPasswordChange}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              error={
                touched.password && !USER_PASSWORD_REGEX.test(userPassword)
              }
              helperText={
                touched.password && !USER_PASSWORD_REGEX.test(userPassword)
                  ? "password should contain:\n1. At least one lowercase letter\n2. At least one uppercase letter\n3. At least one digit\n4. At least one special character from:@$!%*?&\n5. Minimum 8 characters"
                  : ""
              }
              required
            />
            <TextField
              className="room-id-input"
              name="Room ID"
              label="Room ID"
              value={roomId}
              autoComplete="off"
              variant="outlined"
              onChange={handleRoomIdChange}
              onBlur={() => setTouched((prev) => ({ ...prev, roomId: true }))}
              error={touched.roomId && !ROOM_ID_REGEX.test(roomId)}
              helperText={
                touched.roomId && !ROOM_ID_REGEX.test(roomId)
                  ? "Room ID can contain only letters, digits and hyphen"
                  : ""
              }
              required
            />
          </CardContent>
          <CardActions className="login-card-actions">
            <Button
              size="small"
              className="generate-room-button"
              onClick={handleRoomGeneration}
              disableRipple={true}
            >
              Generate Room ID
            </Button>
            <Button
              size="small"
              className="join-room-button"
              onClick={handleRoomJoin}
              disableRipple={true}
              disabled={
                USER_NAME_REGEX.test(userName) &&
                USER_PASSWORD_REGEX.test(userPassword) &&
                ROOM_ID_REGEX.test(roomId)
                  ? false
                  : true
              }
            >
              Join
            </Button>
          </CardActions>
        </Card>
      </Box>
      <SnackBar
        open={snackbarOpen}
        message={snackbarMessage}
        handleClose={handleSnackbarClose}
      />
    </>
  );
}
