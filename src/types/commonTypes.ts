export type MessageType = {
  name: string;
  value: string;
  clientId:string;
};

export type MessageListType = MessageType[];

export type UserType = { name: string; clientId: string };

export type RoomUserType = {
  // id: number;
  name: string;
  clientId: string;
};

export type RoomUsersType = RoomUserType[];
