import { useState } from "react";

import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";

import { useAppSelector } from "@/hooks/storeHooks";

import { RoomUsersType } from "@/types/commonTypes";

import "./customAvatarGroup.scss";

const MAX_VISIBLE_AVATARS = 3;

export default function CustomAvatarGroup({
  fetchedUsers,
}: {
  fetchedUsers: RoomUsersType;
}) {
  const currentUser = useAppSelector((state) => state.user);

  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  // Filter out current user
  const otherUsers = fetchedUsers.filter((user) => {
    if (user.name !== currentUser.name) {
      return true;
    } else if (
      user.name === "guest" &&
      user.clientId !== currentUser.clientId
    ) {
      return true;
    } else {
      return false;
    }
  });

  const visibleUsers = otherUsers.slice(0, MAX_VISIBLE_AVATARS - 1);
  const extraUsers = otherUsers.slice(MAX_VISIBLE_AVATARS - 1);

  return (
    <Box className="custom-avatar-group">
      {visibleUsers.map((user) => (
        <Tooltip
          title={user.name}
          key={user.clientId}
          arrow
          slotProps={{ tooltip: { sx: { fontSize: "0.8rem" } } }}
        >
          <Avatar className="visible-users-avatar">
            {user.name.slice(0, 2)}
          </Avatar>
        </Tooltip>
      ))}

      {extraUsers.length > 0 && (
        <Tooltip
          title="More users"
          arrow
          slotProps={{ tooltip: { sx: { fontSize: "0.8rem" } } }}
        >
          <IconButton disableRipple={true} sx={{ padding: 0 }}>
            <Avatar className="more-users-avatar" onClick={handleOpen}>
              +{extraUsers.length}
            </Avatar>
          </IconButton>
        </Tooltip>
      )}

      {/* Popover for extra users */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box className="popover-outer-container">
          <Typography variant="subtitle2" mb={1}>
            More users
          </Typography>
          <Stack className="popover-inner-container" spacing={1}>
            {extraUsers.map((user) => (
              <Box key={user.clientId} className="popover-more-users">
                <Avatar className="popover-more-users-avatar">
                  {user.name.slice(0, 2)}
                </Avatar>
                <Typography variant="body2">{user.name}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}
