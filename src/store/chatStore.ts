import { create } from "zustand";
import {
  apiClient,
  type ApiChat,
  type ApiMessage,
} from "@/services/api";
import { socketService } from "@/services/socket";
import { SocketMessage } from "@/services/types/interfaces";
import { Chat, ChatState, Message } from "./types/interfaces";
import { convertApiChatToStoreChat } from "./utils/convertApiChatToStoreChat";
import { convertSocketMessageToStoreMessage } from "./utils/convertSocketMessageToStoreMessage";

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  isLoading: false,
  error: null,
  isConnected: false,
  currentUser: null,

  setCurrentUser: (user) => set({ currentUser: user }),

  connectSocket: (token: string) => {
    try {
      socketService.connect(token);

      // Set up message listeners
      socketService.onNewMessage((socketMessage: SocketMessage) => {
        const message = convertSocketMessageToStoreMessage(socketMessage);

        set((state) => {
          const updateChat = (chat: Chat) => {
            // Check if this message already exists (by ID or by content+sender+timestamp similarity)
            const messageExists = chat.messages.some(
              (existingMsg) =>
                existingMsg.id === message.id ||
                (existingMsg.senderId === message.senderId &&
                  existingMsg.content === message.content &&
                  Math.abs(
                    new Date(existingMsg.timestamp).getTime() -
                      new Date(message.timestamp).getTime(),
                  ) < 5000), // Within 5 seconds
            );

            if (messageExists) {
              return chat;
            }

            // Remove any temporary messages with same content from same sender
            const filteredMessages = chat.messages.filter(
              (msg) =>
                !(
                  msg.id.startsWith("temp_") &&
                  msg.senderId === message.senderId &&
                  msg.content === message.content
                ),
            );

            return {
              ...chat,
              messages: [...filteredMessages, message],
              lastMessage: message,
              updatedAt: new Date().toISOString(),
            };
          };

          return {
            chats: state.chats.map((chat) =>
              chat.id === socketMessage.chatId.toString()
                ? updateChat(chat)
                : chat,
            ),
            activeChat:
              state.activeChat?.id === socketMessage.chatId.toString()
                ? updateChat(state.activeChat)
                : state.activeChat,
          };
        });
      });

      socketService.onMessagesRead(({ chatId, userId }) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId.toString()
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg.senderId !== userId.toString()
                      ? { ...msg, read: true }
                      : msg,
                  ),
                }
              : chat,
          ),
          activeChat:
            state.activeChat?.id === chatId.toString()
              ? {
                  ...state.activeChat,
                  messages: state.activeChat.messages.map((msg) =>
                    msg.senderId !== userId.toString()
                      ? { ...msg, read: true }
                      : msg,
                  ),
                }
              : state.activeChat,
        }));
      });

      set({ isConnected: true });
    } catch (error) {
      console.error("❌ Failed to connect to socket:", error);
      set({ error: "Failed to connect to chat server" });
    }
  },

  disconnectSocket: () => {
    socketService.disconnect();
    set({ isConnected: false });
  },

  joinChat: (chatId: string) => {
    socketService.joinChat(parseInt(chatId));
  },

  leaveChat: (chatId: string) => {
    socketService.leaveChat(parseInt(chatId));
  },

  startChat: async (reportId, participantId) => {
    set({ isLoading: true, error: null });
    try {
      const apiChat = await apiClient.createChat(parseInt(reportId), [
        parseInt(participantId),
      ]);
      const chat = convertApiChatToStoreChat(apiChat);

      set((state) => ({
        chats: [chat, ...state.chats.filter((c) => c.id !== chat.id)],
        isLoading: false,
      }));

      // Automatically join the chat room for real-time updates
      get().joinChat(chat.id);

      return chat.id;
    } catch (error) {
      console.error("❌ Failed to start chat:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to start chat",
      });
      throw error;
    }
  },

  sendMessage: async (chatId, content) => {
    set({ error: null });

    // Get current user info for optimistic update
    const currentUser = get().getCurrentUser();
    let optimisticMessage: Message | null = null;

    // Optimistically add the message to sender's UI immediately
    if (currentUser) {
      const tempId = `temp_${currentUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      optimisticMessage = {
        id: tempId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content,
        timestamp: new Date().toISOString(),
        read: true,
      };

      // Add message to current chat immediately for sender
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, optimisticMessage!],
                lastMessage: optimisticMessage!,
                updatedAt: new Date().toISOString(),
              }
            : chat,
        ),
        activeChat:
          state.activeChat?.id === chatId
            ? {
                ...state.activeChat,
                messages: [...state.activeChat.messages, optimisticMessage!],
                lastMessage: optimisticMessage!,
                updatedAt: new Date().toISOString(),
              }
            : state.activeChat,
      }));
    }

    try {
      // Try WebSocket first for real-time delivery
      if (socketService.isConnected()) {
        const success = socketService.sendMessage(parseInt(chatId), content);
        if (success) {
          return;
        } else {
          console.warn("⚠️ WebSocket send failed, falling back to HTTP");
        }
      } else {
        console.warn("⚠️ WebSocket not connected, using HTTP API");
      }

      // Fallback to HTTP API if WebSocket is not connected or failed
      await apiClient.sendMessage(parseInt(chatId), content);

      // Reload the chat to get the confirmed message (only for HTTP fallback)
      await get().loadChatById(chatId);
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      // Rollback optimistic message if send failed
      if (optimisticMessage) {
        const failedId = optimisticMessage.id;
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.filter((m) => m.id !== failedId),
                  lastMessage:
                    chat.messages
                      .filter((m) => m.id !== failedId)
                      .slice(-1)[0] || chat.lastMessage,
                }
              : chat,
          ),
          activeChat:
            state.activeChat?.id === chatId
              ? {
                  ...state.activeChat,
                  messages: state.activeChat.messages.filter(
                    (m) => m.id !== failedId,
                  ),
                  lastMessage:
                    state.activeChat.messages
                      .filter((m) => m.id !== failedId)
                      .slice(-1)[0] || state.activeChat.lastMessage,
                }
              : state.activeChat,
        }));
      }
      set({
        error:
          error instanceof Error ? error.message : "Failed to send message",
      });
      throw error;
    }
  },

  markAsRead: async (chatId) => {
    try {
      if (socketService.isConnected()) {
        socketService.markAsRead(parseInt(chatId));
      } else {
        await apiClient.markMessagesAsRead(parseInt(chatId));
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  },

  loadChats: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiChats = await apiClient.getUserChats();
      const chats = apiChats.map(convertApiChatToStoreChat);
      set({ chats, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load chats",
      });
    }
  },

  loadChatById: async (chatId: string) => {
    set({ isLoading: true, error: null });
    try {
      const apiChat = await apiClient.getChatById(parseInt(chatId));
      const newChat = convertApiChatToStoreChat(apiChat);

      set((state) => {
        const mergeMessages = (existingChat: Chat | null, newChat: Chat) => {
          if (!existingChat) return newChat;

          // Create a map of new messages by ID for quick lookup
          const newMessagesMap = new Map(
            newChat.messages.map((msg) => [msg.id, msg]),
          );

          // Filter out existing messages that are already in newChat,
          // and clean up temporary messages that have been confirmed by the server
          const preservedExistingMessages = existingChat.messages.filter(
            (existingMsg) => {
              if (newMessagesMap.has(existingMsg.id)) return false;
              if (existingMsg.id.startsWith("temp_")) {
                const isConfirmed = newChat.messages.some(
                  (newMsg) =>
                    newMsg.senderId === existingMsg.senderId &&
                    newMsg.content === existingMsg.content,
                );
                return !isConfirmed;
              }
              return true;
            },
          );

          const mergedMessages = [
            ...preservedExistingMessages,
            ...newChat.messages,
          ];
          mergedMessages.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );

          return {
            ...newChat,
            report: newChat.report || existingChat.report,
            messages: mergedMessages,
          };
        };

        const existingChat = state.chats.find((c) => c.id === chatId);
        const mergedChat = mergeMessages(existingChat || null, newChat);

        return {
          chats: state.chats.map((c) => (c.id === chatId ? mergedChat : c)),
          activeChat:
            state.activeChat?.id === chatId ? mergedChat : state.activeChat,
          isLoading: false,
        };
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load chat",
      });
    }
  },

  getChatsByUser: (userId) => {
    return get().chats.filter((chat) =>
      chat.participants.some((p) => p.id === userId),
    );
  },

  getChatById: (id) => {
    return get().chats.find((chat) => chat.id === id);
  },

  setActiveChat: (chat) => {
    set({ activeChat: chat });
    if (chat) {
      get().joinChat(chat.id);
    }
  },

  getCurrentUser: () => {
    const cachedUser = get().currentUser;
    if (cachedUser) return cachedUser;

    // Read unified session key 'petly-auth-store' with fallback to legacy 'auth-storage'
    if (typeof window !== "undefined") {
      const authStorage =
        localStorage.getItem("petly-auth-store") ||
        localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const user = parsed.state?.user || null;
          if (user) {
            set({ currentUser: user });
            return user;
          }
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  clearError: () => {
    set({ error: null });
  },
}));
