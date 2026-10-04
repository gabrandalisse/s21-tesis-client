import { SocketMessage } from "@/services/types/interfaces";
import { Message } from "../types/interfaces";

export const convertSocketMessageToStoreMessage = (
  socketMessage: SocketMessage
): Message => {
  return {
    id: socketMessage.id.toString(),
    senderId: socketMessage.senderId.toString(),
    senderName: socketMessage.senderName,
    content: socketMessage.content,
    timestamp: socketMessage.createdAt,
    read: socketMessage.read,
  };
};
