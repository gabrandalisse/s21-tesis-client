import { ApiChat } from "@/services/types/interfaces";
import { Chat } from "../types/interfaces";
import { convertApiReportToStoreReport } from "./convertApiReportToStoreReport";
import { convertApiMessageToStoreMessage } from "./convertApiMessageToStoreMessage";

export const convertApiChatToStoreChat = (apiChat: ApiChat): Chat => {
  return {
    id: apiChat.id.toString(),
    reportId: apiChat.reportId.toString(),
    report: apiChat.report
      ? convertApiReportToStoreReport(apiChat.report)
      : undefined,
    participants: apiChat.participants.map((p) => ({
      id: p.userId.toString(),
      name: p.user.name,
      email: p.user.email,
    })),
    messages: apiChat.messages.map(convertApiMessageToStoreMessage),
    lastMessage:
      apiChat.messages.length > 0
        ? convertApiMessageToStoreMessage(
            apiChat.messages[apiChat.messages.length - 1]
          )
        : undefined,
    createdAt: apiChat.createdAt,
    updatedAt: apiChat.updatedAt,
  };
};
