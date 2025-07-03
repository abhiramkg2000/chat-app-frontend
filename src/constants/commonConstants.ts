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

export const USER_NAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export const USER_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const ROOM_ID_REGEX = /^[a-zA-Z0-9-]+$/;

export const MESSAGE_REGEX = /^(?!\s*$)[\s\S]+$/;
