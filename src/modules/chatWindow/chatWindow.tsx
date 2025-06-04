import { MouseEvent, useState, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";

import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";

import MessageList from "@/components/messageList/messageList";
import CustomEmojiPicker from "@/components/customEmojiPicker/customEmojiPicker";

import { setUserClientId } from "@/store/users/usersSlice";
import { useAppSelector, useAppDispatch } from "@/hooks/storeHooks";
import { getSocket } from "@/hooks/socketClient";

import { MessageType, MessageListType } from "@/types/commonTypes";

import "./chatWindow.scss";

let typingTimeout: NodeJS.Timeout;

export default function ChatWindow() {
  const currentUser = useAppSelector((state) => state.user);

  const [userMessage, setUserMessage] = useState("");
  const [openPicker, setOpenPicker] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState<MessageListType>([]);
  const [usersTyping, setUsersTyping] = useState<
    { name: String; clientId: string }[]
  >([]);

  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingRef = useRef<HTMLDivElement | null>(null);

  const roomId = sessionStorage.getItem("room_id") || "";

  const handleSendMessage = (e: MouseEvent<HTMLButtonElement>) => {
    if (userMessage) {
      socketRef.current?.emit("message", {
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

  const handleTyping = () => {
    if (!socketRef.current) return;
    socketRef.current?.emit("startTyping", {
      roomId,
      userName: currentUser.name,
    });

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socketRef.current?.emit("stopTyping", {
        roomId,
      });
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
    socket.on("prefetch", (msg: MessageType[]) => {
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
    };
  }, []);

  useEffect(() => {
    if (!currentUser.clientId) return;

    const socket = socketRef.current;
    if (!socket) return;

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

    socket.on("userStoppedTyping", ({ clientId }: { clientId: string }) => {
      setUsersTyping((prev) => prev.filter((u) => u.clientId !== clientId));
    });

    return () => {
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [currentUser.clientId]);

  useEffect(() => {
    if (usersTyping.length > 0 && typingRef.current) {
      typingRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [usersTyping]);

  return (
    <div className="chat-window">
      <div className="message-list-container">
        <MessageList messages={receivedMessages} />
        {usersTyping.length > 0 && (
          <div className="typing-indicator" ref={typingRef}>
            {usersTyping.map((u) => u.name).join(", ")}{" "}
            {usersTyping.length === 1 ? "is" : "are"} typing...
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
            maxRows={3}
            onChange={(e) => {
              setUserMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Prevent newline if needed
                handleSendMessage(e as any);
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
            onClick={handleSendMessage}
          >
            <SendIcon className="send-message-icon" />
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
