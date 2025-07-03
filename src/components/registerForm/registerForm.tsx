import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import SnackBar from "@/components/snackbar/snackbar";

import {
  USER_NAME_REGEX,
  USER_PASSWORD_REGEX,
  USER_NAME_HELPER_TEXT,
  USER_PASSWORD_HELPER_TEXT,
} from "@/constants/commonConstants";

import "./registerForm.scss";

export default function RegisterForm() {
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });

  const router = useRouter();

  const handleUserNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUserName(value);
  };

  const handleUserPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUserPassword(value);
  };

  const handleUserRegister = async () => {
    if (
      USER_NAME_REGEX.test(userName) &&
      USER_PASSWORD_REGEX.test(userPassword)
    ) {
      try {
        const res = await fetch("http://localhost:3001/user/register", {
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

        setSnackbarOpen(true);
        setSnackbarMessage(data.message);

        if (data.success) {
          setUserName("");
          setUserPassword("");
          setTouched({ username: false, password: false });
          router.push("/auth/login");
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Box className="register-page">
        <Card className="register-card">
          <CardContent className="register-card-content">
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
                  ? USER_NAME_HELPER_TEXT
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
                  ? USER_PASSWORD_HELPER_TEXT
                  : ""
              }
              required
            />
          </CardContent>
          <CardActions className="register-card-actions">
            <Button
              size="small"
              className="register-button"
              onClick={handleUserRegister}
              disableRipple={true}
              disabled={
                USER_NAME_REGEX.test(userName) &&
                USER_PASSWORD_REGEX.test(userPassword)
                  ? false
                  : true
              }
            >
              Register
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
