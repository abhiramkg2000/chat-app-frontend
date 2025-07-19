import { forwardRef, Dispatch, SetStateAction } from "react";

import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";

import { useAppSelector } from "@/hooks/storeHooks";

import { INITIAL_EDIT_MESSAGE_STATE } from "@/constants/commonConstants";

import { MessageType } from "@/types/commonTypes";

import "./messageListItem.scss";

const MessageListItem = forwardRef<
  HTMLLIElement,
  {
    message: MessageType;
    selectedMessageId: string;
    setSelectedMessageId: Dispatch<SetStateAction<string>>;
    setIsEditing: Dispatch<SetStateAction<boolean>>;
    setIsReplying: Dispatch<SetStateAction<boolean>>;
    handleEditingMessage: (editMessage: MessageType) => void;
    handleDeleteMessage: (selectedMessageId: string) => void;
  }
>(function MessageListItem(
  {
    message,
    selectedMessageId,
    setSelectedMessageId,
    setIsEditing,
    setIsReplying,
    handleEditingMessage,
    handleDeleteMessage,
  },
  ref
) {
  const currentUser = useAppSelector((state) => state.user);

  const isSameUser = message.name === currentUser.name;

  return (
    <div
      className={`${
        isSameUser
          ? "current-user-message-container"
          : "other-user-message-container"
      } `}
    >
      <ListItem
        className={`${
          isSameUser ? "current-user-message" : "other-user-message"
        }`}
        sx={{
          cursor: !message.isDeleted ? "pointer" : "default",
        }}
        ref={ref}
        onClick={
          !message.isDeleted
            ? () => {
                console.log("selected message", { ...message });
                setIsReplying(false);
                setIsEditing(false);
                handleEditingMessage(INITIAL_EDIT_MESSAGE_STATE);
                if (selectedMessageId === message.messageId) {
                  setSelectedMessageId("");
                } else {
                  setSelectedMessageId(message.messageId);
                }
              }
            : undefined
        }
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
              className="reply-to-message-button"
              disableRipple={true}
              onClick={(e) => {
                e.stopPropagation();
                console.log("same user reply to message", message);
                setIsReplying(true);
                setIsEditing(false);
                handleEditingMessage(INITIAL_EDIT_MESSAGE_STATE);
              }}
            >
              <ReplyIcon />
            </IconButton>
            <IconButton
              className="edit-message-button"
              disableRipple={true}
              onClick={(e) => {
                e.stopPropagation();
                console.log("message to edit", { ...message });
                setIsEditing(true);
                handleEditingMessage(message);
                setIsReplying(false);
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              className="delete-message-button"
              disableRipple={true}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMessage(message.messageId);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        )}
      {!isSameUser &&
        selectedMessageId === message.messageId &&
        !message.isDeleted && (
          <div className="message-action-buttons-container">
            <IconButton
              className="reply-to-message-button"
              disableRipple={true}
              onClick={(e) => {
                e.stopPropagation();
                console.log("other user reply to message", message);
                setIsReplying(true);
                setIsEditing(false);
                handleEditingMessage(INITIAL_EDIT_MESSAGE_STATE);
              }}
            >
              <ReplyIcon />
            </IconButton>
          </div>
        )}
    </div>
  );
});

export default MessageListItem;
