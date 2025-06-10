import { forwardRef, Dispatch, SetStateAction } from "react";

import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useAppSelector } from "@/hooks/storeHooks";

import { MessageType } from "@/types/commonTypes";

import "./messageListItem.scss";

const MessageListItem = forwardRef<
  HTMLLIElement,
  {
    message: MessageType;
    selectedMessageId: string;
    setSelectedMessageId: Dispatch<SetStateAction<string>>;
    isLastMessage: boolean;
    setIsEditing: Dispatch<SetStateAction<boolean>>;
    handleEditingMessage: (editMessage: MessageType) => void;
    handleDeleteMessage: (selectedMessageId: string) => void;
  }
>(function MessageListItem(
  {
    message,
    selectedMessageId,
    setSelectedMessageId,
    isLastMessage,
    setIsEditing,
    handleEditingMessage,
    handleDeleteMessage,
  },
  ref
) {
  const currentUser = useAppSelector((state) => state.user);

  const isSameUser =
    (message.name === currentUser.name &&
      message.clientId === currentUser.clientId) ||
    (message.name === currentUser.name && currentUser.name !== "guest");

  return (
    <div
      className={`${
        isSameUser
          ? "current-user-message-container"
          : "other-user-message-container"
      } ${
        selectedMessageId === message.messageId && !message.isDeleted
          ? "selected"
          : ""
      }`}
      onClick={
        isSameUser && !message.isDeleted
          ? () => {
              console.log("selected message", { ...message });
              setSelectedMessageId(message.messageId);
            }
          : undefined
      }
    >
      <ListItem
        className={`${
          isSameUser ? "current-user-message" : "other-user-message"
        }`}
        sx={{
          cursor: isSameUser && !message.isDeleted ? "pointer" : "default",
        }}
        ref={isLastMessage ? ref : null}
      >
        <ListItemText
          className={`${
            isSameUser
              ? "current-user-message-username"
              : "other-user-message-username"
          }`}
          primary={message.name}
        />
        {!message.isDeleted ? (
          <>
            <ListItemText
              className={`${
                isSameUser
                  ? "current-user-message-text"
                  : "other-user-message-text"
              }`}
              primary={message.value}
            />
            <ListItemText
              className={`${
                isSameUser
                  ? "current-user-message-edited-at"
                  : "other-user-message-edited-at"
              }`}
              primary={
                message.isEdited ? `Edited at: ${message.editedAt} ` : ""
              }
              primaryTypographyProps={{ variant: "body2" }}
            />
          </>
        ) : (
          <ListItemText
            className={`${
              isSameUser
                ? "current-user-message-deleted"
                : "other-user-message-deleted"
            }`}
            primary={"Message deleted by its author"}
            primaryTypographyProps={{ variant: "body2" }}
          />
        )}
      </ListItem>
      {isSameUser &&
        selectedMessageId === message.messageId &&
        !message.isDeleted && (
          <div className="message-action-buttons-container">
            <IconButton
              className="edit-message-button"
              disableRipple={true}
              onClick={() => {
                console.log("message to edit", { ...message });
                setIsEditing(true);
                handleEditingMessage(message);
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              className="delete-message-button"
              disableRipple={true}
              onClick={() => handleDeleteMessage(message.messageId)}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        )}
    </div>
  );
});

export default MessageListItem;
