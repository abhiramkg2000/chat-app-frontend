import Snackbar from "@mui/material/Snackbar";

import "./snackbar.scss";

export default function SnackBar({
  open,
  message,
  handleClose,
}: {
  open: boolean;
  message: string;
  handleClose: () => void;
}) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      message={message}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      className="snackbar"
    />
  );
}
