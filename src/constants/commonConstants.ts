export const INITIAL_EDIT_MESSAGE_STATE = {
  name: "",
  value: "",
  clientId: "",
  messageId: "",
  isEdited: false,
  editedAt: "",
  isDeleted: false,
  replyTo: "",
};

// REGEX
export const USER_NAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export const USER_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const ROOM_ID_REGEX = /^[a-zA-Z0-9-]+$/;

export const MESSAGE_REGEX = /^(?!\s*$)[\s\S]+$/;

// Helper text
export const USER_NAME_HELPER_TEXT =
  "Username can contain only letters, digits and underscore";
export const USER_PASSWORD_HELPER_TEXT =
  "Password should contain:\n1. At least one lowercase letter\n2. At least one uppercase letter\n3. At least one digit\n4. At least one special character from:@$!%*?&\n5. Minimum 8 characters";

export const ROOM_ID_HELPER_TEXT =
  "Room ID can contain only letters, digits and hyphen";

// API URL
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
