import { useEffect, useState, useCallback } from 'react'
import { socketService } from '@/services/socket'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'

import { UseChatSocketReturn } from './types/interfaces'

/**
 * Custom hook to manage the WebSocket lifecycle for the chat service.
 * Handles automatic connection, room joining/leaving, and message dispatch.
 */
export function useChatSocket(explicitToken?: string | null): UseChatSocketReturn {
  const storeToken = useAuthStore((state) => state.token)
  const token = explicitToken !== undefined ? explicitToken : storeToken

  const [isConnected, setIsConnected] = useState<boolean>(
    socketService.isConnected()
  )

  const {
    connectSocket,
    disconnectSocket,
    joinChat: storeJoinChat,
    leaveChat: storeLeaveChat,
    sendMessage: storeSendMessage,
    markAsRead: storeMarkAsRead,
  } = useChatStore()

  const connect = useCallback(
    (authToken: string) => {
      if (authToken) {
        connectSocket(authToken)
        setIsConnected(true)
      }
    },
    [connectSocket]
  )

  const disconnect = useCallback(() => {
    disconnectSocket()
    setIsConnected(false)
  }, [disconnectSocket])

  const joinChat = useCallback(
    (chatId: number | string) => {
      storeJoinChat(chatId.toString())
    },
    [storeJoinChat]
  )

  const leaveChat = useCallback(
    (chatId: number | string) => {
      storeLeaveChat(chatId.toString())
    },
    [storeLeaveChat]
  )

  const sendMessage = useCallback(
    async (chatId: number | string, content: string) => {
      return storeSendMessage(chatId.toString(), content)
    },
    [storeSendMessage]
  )

  const markAsRead = useCallback(
    async (chatId: number | string) => {
      return storeMarkAsRead(chatId.toString())
    },
    [storeMarkAsRead]
  )

  // Manage connection lifecycle with the provided token
  useEffect(() => {
    if (!token) return

    connect(token)
    setIsConnected(true)

    const checkInterval = setInterval(() => {
      setIsConnected(socketService.isConnected())
    }, 2000)

    return () => {
      clearInterval(checkInterval)
    }
  }, [token, connect])

  return {
    isConnected,
    connect,
    disconnect,
    joinChat,
    leaveChat,
    sendMessage,
    markAsRead,
  }
}
