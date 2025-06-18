import { useState, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";

import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";

import MessageList from "@/components/messageList/messageList";
import CustomEmojiPicker from "@/components/customEmojiPicker/customEmojiPicker";

import { setUserClientId } from "@/store/users/usersSlice";
import { useAppSelector, useAppDispatch } from "@/hooks/storeHooks";
import { getSocket } from "@/hooks/socketClient";

import { formatEditedAt, formatReplyToText } from "@/helper/commonHelper";

import { INITIAL_EDIT_MESSAGE_STATE } from "@/constants/commonConstants";

import { MessageType, MessageListType } from "@/types/commonTypes";

import "./chatWindow.scss";

export default function ChatWindow() {
  const currentUser = useAppSelector((state) => state.user);

  const [userMessage, setUserMessage] = useState("");
  const [editMessage, setEditMessage] = useState<MessageType>(
    INITIAL_EDIT_MESSAGE_STATE
  );
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState<MessageListType>([]);
  const [usersTyping, setUsersTyping] = useState<
    { name: String; clientId: string }[]
  >([]);

  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const roomId = sessionStorage.getItem("room_id") || "";

  const repliedToText =
    receivedMessages.find((obj) => obj.messageId === selectedMessageId)
      ?.value || "";

  const truncatedRepliedTo = formatReplyToText(repliedToText);

  const handleSendMessage = () => {
    if (userMessage) {
      socketRef.current?.emit("message:add", {
        roomId: roomId,
        message: {
          name: currentUser.name,
          value: userMessage,
          clientId: currentUser.clientId,
        },
      });

      setUserMessage("");
    }
  };

  const handleEditingMessage = (editMessage: MessageType) => {
    setUserMessage(editMessage.value);
    setEditMessage(editMessage);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleEditMessage = () => {
    if (userMessage) {
      // Checks if the message was actually edited
      if (userMessage !== editMessage.value) {
        socketRef.current?.emit("message:edit", {
          roomId: roomId,
          message: {
            ...editMessage,
            value: userMessage,
            isEdited: true,
            editedAt: formatEditedAt(),
          },
        });
      }

      console.log("edited message", { ...editMessage, value: userMessage });
      setUserMessage("");
      setIsEditing(false);
      setEditMessage(INITIAL_EDIT_MESSAGE_STATE);
      setSelectedMessageId("");
    }
  };

  const handleReplyToMessage = () => {
    if (userMessage) {
      socketRef.current?.emit("message:replyToMessage", {
        roomId: roomId,
        message: {
          name: currentUser.name,
          value: userMessage,
          clientId: currentUser.clientId,
          replyTo: selectedMessageId,
        },
      });

      console.log("replied to message", selectedMessageId);
      setUserMessage("");
      setIsReplying(false);
      setSelectedMessageId("");
    }
  };

  const handleReplyCancel = () => {
    setIsReplying(false);
  };

  const handleDeleteMessage = (selectedMessageId: string) => {
    if (selectedMessageId) {
      socketRef.current?.emit("message:delete", {
        roomId: roomId,
        messageId: selectedMessageId,
      });

      console.log("message deleted");
      setUserMessage("");
      setIsEditing(false);
      setEditMessage(INITIAL_EDIT_MESSAGE_STATE);
      setIsReplying(false);
      setSelectedMessageId("");
    }
  };

  console.log("set selected message Id", selectedMessageId);

  const handleTyping = () => {
    if (!socketRef.current) return;

    // User starts typing
    socketRef.current?.emit("startTyping", {
      roomId,
      userName: currentUser.name,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    typingTimeoutRef.current = setTimeout(() => {
      // User stops typing
      socketRef.current?.emit("stopTyping", {
        roomId,
      });
      typingTimeoutRef.current = null;
    }, 1000); // stop typing after 1s of no input
  };

  useEffect(() => {
    // Connect to the NestJS WebSocket gateway
    const socket = getSocket();
    socketRef.current = socket;

    // Socket connection
    socket.on("connect", () => {
      console.log("in chatWindow Connected, joining room:", roomId);
      socket.emit("joinroom", {
        roomId: roomId,
        userName: currentUser.name,
      });
    });

    // Prefetch messages
    socket.on("prefetch", (msg: MessageListType) => {
      setReceivedMessages(msg);
    });

    // Listen to messages
    socket.on("reply", (msg: MessageType) => {
      setReceivedMessages((prev) => [...prev, msg]);
      console.log("server", msg);
    });

    // User clientId
    socket.on("clientId", (clientId: string) => {
      console.log("current clientId", clientId);
      dispatch(setUserClientId({ clientId }));
      socket.off("clientId");
    });

    return () => {
      socket.off("connect");
      socket.off("prefetch");
      socket.off("reply");

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!currentUser.clientId) return;

    const socket = socketRef.current;
    if (!socket) return;

    // Listen to user typing
    socket.on(
      "userTyping",
      ({ userName, clientId }: { userName: string; clientId: string }) => {
        if (clientId !== currentUser.clientId) {
          setUsersTyping((prev) => {
            const alreadyExists = prev.some((u) => u.clientId === clientId);
            if (alreadyExists) return prev;
            return [...prev, { name: userName, clientId }];
          });
        }
      }
    );

    // Listen to user stopped typing
    socket.on("userStoppedTyping", ({ clientId }: { clientId: string }) => {
      setUsersTyping((prev) => prev.filter((u) => u.clientId !== clientId));
    });

    return () => {
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [currentUser.clientId]);

  return (
    <div className="chat-window">
      <div className="message-list-container">
        <MessageList
          messages={receivedMessages}
          selectedMessageId={selectedMessageId}
          setSelectedMessageId={setSelectedMessageId}
          setIsEditing={setIsEditing}
          setIsReplying={setIsReplying}
          handleEditingMessage={handleEditingMessage}
          handleDeleteMessage={handleDeleteMessage}
        />
      </div>
      <div className="typing-indicator-container">
        {usersTyping.length > 0 && (
          <div className="typing-indicator">
            {usersTyping.map((u) => u.name).join(", ")}{" "}
            {usersTyping.length === 1 ? "is" : "are"} typing...
          </div>
        )}
      </div>
      <div className="reply-to-message-container">
        {isReplying && (
          <div className="reply-to-message">
            <div className="reply-text">{`"${truncatedRepliedTo}"`}</div>
            <div className="reply-close-button">
              <IconButton disableRipple={true} onClick={handleReplyCancel}>
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        )}
      </div>
      <div className="message-input-outer-container">
        <div className="message-input-inner-container">
          <TextField
            className="message-input"
            inputRef={inputRef}
            name="userMessage"
            value={userMessage}
            placeholder="Enter your message"
            autoFocus
            multiline
            minRows={1}
            maxRows={4}
            onChange={(e) => {
              setUserMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Prevent newline if needed
                if (isEditing) {
                  handleEditMessage();
                } else if (isReplying) {
                  handleReplyToMessage();
                } else {
                  handleSendMessage();
                }
              }
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    className="open-emoji-button"
                    disableRipple={true}
                    onClick={() => {
                      setOpenPicker((prev) => !prev);
                    }}
                  >
                    <InsertEmoticonIcon className="insert-emoji-icon" />
                  </IconButton>
                ),
              },
            }}
          />
          <IconButton
            className="send-message-button"
            disableRipple={true}
            onClick={
              isEditing
                ? () => handleEditMessage()
                : isReplying
                ? () => handleReplyToMessage()
                : () => handleSendMessage()
            }
          >
            {isEditing ? (
              <DoneIcon className="done-message-icon" />
            ) : (
              <SendIcon className="send-message-icon" />
            )}
          </IconButton>
          <CustomEmojiPicker
            inputRef={inputRef}
            userMessage={userMessage}
            setUserMessage={setUserMessage}
            openPicker={openPicker}
            setOpenPicker={setOpenPicker}
          />
        </div>
      </div>
    </div>
  );
}
