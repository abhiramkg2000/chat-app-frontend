import { useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Logout from "@mui/icons-material/Logout";

import { resetUser } from "@/store/users/usersSlice";
import { useAppSelector, useAppDispatch } from "@/hooks/storeHooks";
import { disconnectSocket } from "@/hooks/socketClient";

import "./accountMenu.scss";

export default function AccountMenu() {
  const user = useAppSelector((state) => state.user);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    handleMenuClose();
    disconnectSocket();
    dispatch(resetUser());
    sessionStorage.removeItem("room_id");
    router.push("/");
  };

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box className="account-menu">
        <IconButton disableRipple={true} sx={{ padding: 0 }}>
          <Avatar className="current-user-avatar" onClick={handleMenuClick}>
            {user.name.slice(0, 2)}
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
    </>
  );
}
