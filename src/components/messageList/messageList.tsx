import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";

import List from "@mui/material/List";

import MessageListItem from "../messageListItem/messageListItem";
import RepliedMessageItem from "../repliedMessageItem/repliedMessageItem";

import { useAppSelector } from "@/hooks/storeHooks";

import { MessageType, MessageListType } from "@/types/commonTypes";

import "./messageList.scss";

export default function MessageList({
  messages,
  selectedMessageId,
  setSelectedMessageId,
  setIsEditing,
  setIsReplying,
  handleEditingMessage,
  handleDeleteMessage,
}: {
  messages: MessageListType;
  selectedMessageId: string;
  setSelectedMessageId: Dispatch<SetStateAction<string>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  setIsReplying: Dispatch<SetStateAction<boolean>>;
  handleEditingMessage: (editMessage: MessageType) => void;
  handleDeleteMessage: (selectedMessageId: string) => void;
}) {
  const currentUser = useAppSelector((state) => state.user);

  const [isAtBottom, setIsAtBottom] = useState(true);

  const listRef = useRef<HTMLUListElement | null>(null); // scroll container ref
  const lastMessageRef = useRef<HTMLLIElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLLIElement | null>>({});

  // Add scroll listener
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const handleScroll = () => {
      const threshold = 200; // px from bottom
      const atBottom =
        listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight <
        threshold;
      console.log("atBottom", atBottom);
      setIsAtBottom(atBottom);
    };

    listEl.addEventListener("scroll", handleScroll);
    return () => listEl.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];
    const isCurrentUserMessage = lastMessage.clientId === currentUser.clientId;

    if (isAtBottom || isCurrentUserMessage) {
      console.log("lastMessageRef: ", lastMessageRef.current);
      lastMessageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [messages.length]);

  return (
    <List className="message-list" ref={listRef}>
      {messages.map((obj, index) => {
        // Create ref for each message if it doesn't exist yet
        if (!messageRefs.current[obj.messageId]) {
          messageRefs.current[obj.messageId] = null;
        }

        if (obj.replyTo) {
          return (
            <RepliedMessageItem
              key={index}
              message={obj}
              selectedMessageId={selectedMessageId}
              setSelectedMessageId={setSelectedMessageId}
              setIsEditing={setIsEditing}
              setIsReplying={setIsReplying}
              handleEditingMessage={handleEditingMessage}
              handleDeleteMessage={handleDeleteMessage}
              repliedToMessage={
                messages.find((msg) => msg.messageId === obj.replyTo)?.value ||
                ""
              }
              ref={(el) => {
                messageRefs.current[obj.messageId] = el;
                if (index === messages.length - 1) {
                  lastMessageRef.current = el;
                }
              }}
              // Pass the map of refs to scroll to replied message
              messageRefs={messageRefs.current}
            />
          );
        } else {
          return (
            <MessageListItem
              key={index}
              message={obj}
              selectedMessageId={selectedMessageId}
              setSelectedMessageId={setSelectedMessageId}
              setIsEditing={setIsEditing}
              setIsReplying={setIsReplying}
              handleEditingMessage={handleEditingMessage}
              handleDeleteMessage={handleDeleteMessage}
              ref={(el) => {
                messageRefs.current[obj.messageId] = el;
                if (index === messages.length - 1) {
                  lastMessageRef.current = el;
                }
              }}
            />
          );
        }
      })}
    </List>
  );
}
