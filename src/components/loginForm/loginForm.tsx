import { ChangeEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import { setUserName } from "@/store/users/usersSlice";
import { useAppSelector, useAppDispatch } from "@/hooks/storeHooks";

import "./loginForm.scss";

export default function LoginForm() {
  const currentUser = useAppSelector((state) => state.user);

  const [roomId, setRoomId] = useState("");
  const [isValidRoom, setIsValidRoom] = useState(false);
  const [error, setError] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleRoomGeneration = () => {
    const unique_Id = uuidv4();
    setRoomId(unique_Id);
    setError(false);
    sessionStorage.setItem("room_id", unique_Id);
  };

  const handleRoomJoin = () => {
    validateRoomId();
  };

  const handleUserNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    dispatch(setUserName({ name: value }));
  };

  const handleRoomIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
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
        setIsValidRoom(true);
        setError(false);
      } else if (roomId === sessionStorage.getItem("room_id")) {
        console.log("room is a generated one");
        setIsValidRoom(true);
        setError(false);
      } else {
        console.log("no such room exists");
        setIsValidRoom(false);
        setError(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (isValidRoom) {
      if (!currentUser.name) {
        dispatch(setUserName({ name: "guest" }));
      }
      sessionStorage.setItem("room_id", roomId);
      router.push("/chats");
    }
  }, [isValidRoom]);

  return (
    <Box className="login-page">
      <Card className="login-card">
        <CardContent className="login-card-content">
          <TextField
            className="user-name-input"
            name="user Name"
            label="User Name"
            value={currentUser.name}
            // autoComplete="off"
            variant="outlined"
            onChange={handleUserNameChange}
            // error={error.username}
            // helperText={error.username ? "please enter a user name" : ""}
            // required
          />
          <TextField
            className="room-id-input"
            name="Room ID"
            label="Room ID"
            value={roomId}
            autoComplete="off"
            variant="outlined"
            onChange={handleRoomIdChange}
            error={error}
            helperText={
              error
                ? "Incorrect Room ID, please check the ID or generate new one. "
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
            disabled={roomId ? false : true}
          >
            Join
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
