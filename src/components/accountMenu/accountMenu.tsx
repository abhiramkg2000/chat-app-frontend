import { useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Logout from "@mui/icons-material/Logout";

import SnackBar from "@/components/snackbar/snackbar";

import { resetUser } from "@/store/users/usersSlice";
import { useAppDispatch } from "@/hooks/storeHooks";
import { disconnectSocket } from "@/hooks/socketClient";

import "./accountMenu.scss";

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const open = Boolean(anchorEl);

  const router = useRouter();
  const dispatch = useAppDispatch();

  const userName = sessionStorage.getItem("user_name") || "";

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:3001/user/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = await res.json();
      console.log("Logout response:", data);

      setSnackbarMessage(data.message);
      setSnackbarOpen(true);
    } catch (e) {
      console.log(e);
      setSnackbarMessage("Logout failed");
      setSnackbarOpen(true);
    }

    handleMenuClose();
    disconnectSocket();

    setTimeout(() => {
      router.push("/auth/login");
    }, 500);

    setTimeout(() => {
      dispatch(resetUser());
      sessionStorage.removeItem("room_id");
      sessionStorage.removeItem("user_name");
    }, 1000);
  };

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Box className="account-menu">
        <IconButton disableRipple={true} sx={{ padding: 0 }}>
          <Avatar className="current-user-avatar" onClick={handleMenuClick}>
            {userName.slice(0, 2)}
          </Avatar>
        </IconButton>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                left: 15,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          disableRipple={true}
          onClick={handleLogout}
          sx={{ backgroundColor: "white !important" }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      <SnackBar
        open={snackbarOpen}
        message={snackbarMessage}
        handleClose={handleSnackbarClose}
      />
    </>
  );
}
