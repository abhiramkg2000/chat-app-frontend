import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";

import List from "@mui/material/List";

import MessageListItem from "../messageListItem/messageListItem";

import { MessageType, MessageListType } from "@/types/commonTypes";

import "./messageList.scss";

export default function MessageList({
  messages,
  setIsEditing,
  handleEditingMessage,
  handleDeleteMessage,
}: {
  messages: MessageListType;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  handleEditingMessage: (editMessage: MessageType) => void;
  handleDeleteMessage: (selectedMessageId: string) => void;
}) {
  const [selectedMessageId, setSelectedMessageId] = useState("");

  const lastMessageRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    // console.log("lastMessageRef: ", lastMessageRef.current);
    lastMessageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [messages]);

  return (
    <List className="message-list">
      {messages.map((obj, index) => {
        return (
          <MessageListItem
            key={index}
            message={obj}
            selectedMessageId={selectedMessageId}
            setSelectedMessageId={setSelectedMessageId}
            isLastMessage={index === messages.length - 1}
            setIsEditing={setIsEditing}
            handleEditingMessage={handleEditingMessage}
            handleDeleteMessage={handleDeleteMessage}
            ref={lastMessageRef}
          />
        );
      })}
    </List>
  );
}
