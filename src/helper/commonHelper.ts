import { format, isToday, isYesterday } from "date-fns";

import { MessageType, GroupedMessageType } from "@/types/commonTypes";

export const getEmojiFromUnified = (emojiUnified: string) => {
  const symbol = emojiUnified.split("-");
  const codesArray: Array<string> = [];

  symbol.forEach((element) => codesArray.push("0x" + element));
  const emoji = String.fromCodePoint(
    ...codesArray.map((code) => parseInt(code, 16))
  );
  return emoji;
};

export const formatEditedAt = (editedDate: Date | string | undefined) => {
  if (!editedDate) return "";

  const date = new Date(editedDate);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = String(date.getFullYear()).slice(-2); // Get last two digits

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
};

export function formatReplyToText(text: string, maxLength = 30): string {
  if (!text) return "";

  const hasNewline = text.includes("\n");
  const firstLine = text.split("\n")[0];

  let result = firstLine;

  if (result.length > maxLength) {
    result = result.slice(0, maxLength);
    return result + "...";
  }

  return hasNewline ? result + "..." : result;
}

export function formatTypingIndicatorText(
  usersTyping: { name: string; clientId: string }[],
  maxVisible = 2
) {
  if (!usersTyping || usersTyping.length === 0) return "";

  const visibleUsers = usersTyping.slice(0, maxVisible);
  const othersCount = usersTyping.length - visibleUsers.length;
  const names = visibleUsers.map((u) => u.name).join(", ");

  if (othersCount > 0) {
    return `${names} and ${othersCount} other${
      othersCount > 1 ? "s" : ""
    } are typing...`;
  } else {
    return `${names} ${usersTyping.length === 1 ? "is" : "are"} typing...`;
  }
}

// Helper to convert UTC date string to local Date object
function convertUTCToLocal(dateInput: string | Date | undefined): Date {
  if (!dateInput) return new Date();

  const utcDate =
    typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  return new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds(),
    utcDate.getUTCMilliseconds()
  );
}

export function groupMessagesByDate(messages: MessageType[]) {
  const result: GroupedMessageType[] = [];
  let currentDateKey = "";

  messages.forEach((msg) => {
    const localDate = convertUTCToLocal(msg.createdAt || "");
    const msgDateKey = format(localDate, "yyyy-MM-dd"); // for comparison

    let readableDate = "";

    if (isToday(localDate)) {
      readableDate = "Today";
    } else if (isYesterday(localDate)) {
      readableDate = "Yesterday";
    } else {
      readableDate = format(localDate, "dd-MM-yyyy");
    }

    if (msgDateKey !== currentDateKey) {
      result.push({ type: "date", date: readableDate });
      currentDateKey = msgDateKey;
    }

    result.push({ type: "message", message: msg });
  });

  return result;
}
