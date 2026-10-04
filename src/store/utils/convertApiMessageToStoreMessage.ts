import { ApiMessage } from "@/services/types/interfaces";
import { Message } from "../types/interfaces";

export const convertApiMessageToStoreMessage = (apiMessage: ApiMessage): Message => {
  return {
    id: apiMessage.id.toString(),
    senderId: apiMessage.senderId.toString(),
    senderName: apiMessage.sender.name,
    content: apiMessage.content,
    timestamp: apiMessage.createdAt,
    read: apiMessage.read,
  };
};
