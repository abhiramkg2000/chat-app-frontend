import { useEffect, useRef } from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import { useAppSelector } from "@/hooks/storeHooks";

import { MessageListType } from "@/types/commonTypes";

import "./messageList.scss";

export default function MessageList({
  messages,
}: {
  messages: MessageListType;
}) {
  const currentUser = useAppSelector((state) => state.user);

  const lastMessageRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [messages]);

  return (
    <List className="message-list">
      {messages.map((obj, index) => {
        if (
          (obj.name === currentUser.name &&
            obj.clientId === currentUser.clientId) ||
          (obj.name === currentUser.name && currentUser.name !== "guest")
        ) {
          return (
            <ListItem
              key={index}
              className="current-user-message-list-item"
              ref={index === messages.length - 1 ? lastMessageRef : null}
            >
              <ListItemText
                className="current-user-message-list-item-username"
                primary={obj.name}
              />
              <ListItemText
                className="current-user-message-list-item-text"
                primary={obj.value}
              />
            </ListItem>
          );
        } else {
          return (
            <ListItem
              key={index}
              className="other-user-message-list-item"
              ref={index === messages.length - 1 ? lastMessageRef : null}
            >
              <ListItemText
                className="other-user-message-list-item-username"
                primary={obj.name}
              />
              <ListItemText
                className="other-user-message-list-item-text"
                primary={obj.value}
              />
            </ListItem>
          );
        }
      })}
    </List>
  );
}
