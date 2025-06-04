import { Dispatch, SetStateAction, RefObject } from "react";
import EmojiPicker from "emoji-picker-react";

import { getEmojiFromUnified } from "@/helper/commonHelper";

type CustomEmojiPickerProps = {
  inputRef: RefObject<HTMLInputElement>;
  userMessage: string;
  setUserMessage: Dispatch<SetStateAction<string>>;
  openPicker: boolean;
  setOpenPicker: Dispatch<SetStateAction<boolean>>;
};

import "./customEmojiPicker.scss";

export default function CustomEmojiPicker({
  inputRef,
  userMessage,
  setUserMessage,
  openPicker,
  setOpenPicker,
}: CustomEmojiPickerProps) {
  const handleEmojiInsertion = (emojiUnified: string) => {
    const emoji = getEmojiFromUnified(emojiUnified);

    if (inputRef.current) {
      const inputElement = inputRef.current;

      // Get the current cursor position
      const cursorPosition = inputElement.selectionStart ?? 0;

      // Split the current text into two parts: before and after the cursor
      const beforeText = userMessage.slice(0, cursorPosition);
      const afterText = userMessage.slice(cursorPosition);

      // console.log({ beforeText, afterText, cursorPosition });

      // Insert the emoji at the cursor position
      const newText = beforeText + emoji + afterText;

      // Update the state with the new text
      setUserMessage(newText);

      // Set the cursor position right after the emoji
      setTimeout(() => {
        inputElement.selectionStart = inputElement.selectionEnd =
          cursorPosition + emoji.length;
        inputElement.focus();
      }, 0);
    }
  };

  return (
    <>
      <div
        className="emoji-picker-modal-backdrop"
        style={{
          zIndex: openPicker ? 1 : -1,
        }}
        onClick={() => setOpenPicker(false)}
      >
        {/* Modal backdrop of custom emoji */}
      </div>
      <div
        className="emoji-picker-container"
        style={{
          zIndex: openPicker ? 2 : 1,
        }}
      >
        <EmojiPicker
          open={openPicker}
          onEmojiClick={(e) => {
            handleEmojiInsertion(e.unified);
          }}
        />
      </div>
    </>
  );
}
