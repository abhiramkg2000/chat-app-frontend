import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";

import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import MessageListItem from "../messageListItem/messageListItem";
import RepliedMessageItem from "../repliedMessageItem/repliedMessageItem";

import { useAppSelector } from "@/hooks/storeHooks";

import { SCROLL_THRESHOLD } from "@/constants/commonConstants";

import { MessageType, GroupedMessageType } from "@/types/commonTypes";

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
  messages: GroupedMessageType[];
  selectedMessageId: string;
  setSelectedMessageId: Dispatch<SetStateAction<string>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  setIsReplying: Dispatch<SetStateAction<boolean>>;
  handleEditingMessage: (editMessage: MessageType) => void;
  handleDeleteMessage: (selectedMessageId: string) => void;
}) {
  const currentUser = useAppSelector((state) => state.user);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<
    string | null
  >(null);

  const listRef = useRef<HTMLUListElement | null>(null); // scroll container ref
  const lastMessageRef = useRef<HTMLLIElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const unreadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasScrolledOnLogin = useRef<boolean>(false);

  // Scroll to first unread message
  const scrollToFirstUnread = () => {
    if (firstUnreadMessageId && messageRefs.current[firstUnreadMessageId]) {
      // Smoothly scroll the chat container so the first unread message appears at the top of the visible area
      messageRefs.current[firstUnreadMessageId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Delay clearing the unread markers
      setTimeout(() => {
        setUnreadCount(0);
        setFirstUnreadMessageId(null);
      }, 3000);
    }
  };

  // Scroll to the bottom of the message list
  const scrollToBottom = () => {
    if (listRef.current) {
      // Smoothly scroll the chat container all the way to the bottom of the message list
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const handleScroll = () => {
      /*  
        scrollHeight: The total height of all messages (including the ones not visible)
        scrollTop: How far the user has scrolled from the top
        clientHeight: The height of the visible area 
      */
      const atBottom =
        listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight <
        SCROLL_THRESHOLD; // px from the bottom of the visible area to be considered at the bottom
      // console.log("atBottom", atBottom);

      setIsAtBottom(atBottom);

      // Clear unread message indicator if the user is at the bottom
      if (atBottom) {
        if (unreadTimeoutRef.current) {
          clearTimeout(unreadTimeoutRef.current);
          unreadTimeoutRef.current = null;
        }

        unreadTimeoutRef.current = setTimeout(() => {
          setUnreadCount(0);
          setFirstUnreadMessageId(null);
          unreadTimeoutRef.current = null;
        }, 3000);
      }
    };

    // Add scroll listener
    listEl.addEventListener("scroll", handleScroll);

    return () => {
      listEl.removeEventListener("scroll", handleScroll);

      if (unreadTimeoutRef.current) {
        clearTimeout(unreadTimeoutRef.current);
        unreadTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];
    const isCurrentUserMessage =
      lastMessage.message?.clientId === currentUser.clientId;

    // Wait for DOM to paint before checking scroll position
    requestAnimationFrame(() => {
      if (listRef.current) {
        const listEl = listRef.current;

        /*  
          scrollHeight: The total height of all messages (including the ones not visible)
          scrollTop: How far the user has scrolled from the top
          clientHeight: The height of the visible area 
        */
        const atBottom =
          listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight <
          SCROLL_THRESHOLD; // px from the bottom of the visible area to be considered at the bottom

        setIsAtBottom(atBottom);

        // To scroll to the bottom, if the current user sends a message or if the users in the room are near the bottom of the message list
        if (atBottom || isCurrentUserMessage) {
          // console.log("lastMessageRef: ", lastMessageRef.current);
          lastMessageRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          setUnreadCount(0);
          setFirstUnreadMessageId(null);
        } else {
          if (unreadCount === 0) {
            setFirstUnreadMessageId(lastMessage.message?.messageId!);
          }

          setUnreadCount((prev) => prev + 1);
        }
      }
    });
  }, [messages.length]);

  // To scroll to the bottom of the message list on login/re-login
  useEffect(() => {
    if (!lastMessageRef.current) return;
    if (hasScrolledOnLogin.current) return;

    lastMessageRef.current?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });

    hasScrolledOnLogin.current = true;
  }, [messages.length]);

  return (
    <List className="message-list" ref={listRef}>
      {messages.map((obj, index) => {
        if (obj.type === "date" && obj.date) {
          return (
            <div key={`date-${index}`} className="date-separator">
              {obj.date}
            </div>
          );
        } else if (obj.type === "message" && obj.message) {
          const isUnreadMarker =
            obj.message?.messageId === firstUnreadMessageId;

          // Create ref for each message if it doesn't exist yet
          if (!messageRefs.current[obj.message.messageId]) {
            messageRefs.current[obj.message.messageId] = null;
          }

          return (
            <div key={index}>
              {isUnreadMarker && unreadCount > 0 && (
                <Divider
                  variant="middle"
                  component={"li"}
                  className="unread-message-banner"
                >
                  {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
                </Divider>
              )}

              {obj.message.replyTo ? (
                <RepliedMessageItem
                  key={index}
                  message={obj.message}
                  selectedMessageId={selectedMessageId}
                  setSelectedMessageId={setSelectedMessageId}
                  setIsEditing={setIsEditing}
                  setIsReplying={setIsReplying}
                  handleEditingMessage={handleEditingMessage}
                  handleDeleteMessage={handleDeleteMessage}
                  repliedToMessage={
                    messages.find(
                      (msg) => msg.message?.messageId === obj.message?.replyTo
                    )?.message?.value || ""
                  }
                  ref={(el) => {
                    messageRefs.current[obj.message?.messageId!] = el;
                    if (index === messages.length - 1) {
                      lastMessageRef.current = el;
                    }
                  }}
                  // Pass the map of refs to scroll to replied message
                  messageRefs={messageRefs.current}
                />
              ) : (
                <MessageListItem
                  key={index}
                  message={obj.message}
                  selectedMessageId={selectedMessageId}
                  setSelectedMessageId={setSelectedMessageId}
                  setIsEditing={setIsEditing}
                  setIsReplying={setIsReplying}
                  handleEditingMessage={handleEditingMessage}
                  handleDeleteMessage={handleDeleteMessage}
                  ref={(el) => {
                    messageRefs.current[obj.message?.messageId!] = el;
                    if (index === messages.length - 1) {
                      lastMessageRef.current = el;
                    }
                  }}
                />
              )}
            </div>
          );
        }
      })}
      {unreadCount > 0 && !isAtBottom && (
        <li
          className="floating-unread-message-banner"
          onClick={scrollToFirstUnread}
        >
          {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
          <ArrowDownwardIcon fontSize="small" />
        </li>
      )}
      {unreadCount === 0 && !isAtBottom && (
        <li className="scroll-to-bottom-button" onClick={scrollToBottom}>
          Scroll to Bottom <ArrowDownwardIcon fontSize="small" />
        </li>
      )}
    </List>
  );
}
