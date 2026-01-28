'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/providers'
import toast from 'react-hot-toast'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws/bids'

type MessageType =
  | 'BID_PLACED'
  | 'BID_UPDATED'
  | 'BID_STATUS_UPDATED'
  | 'NEW_LOWER_BID'
  | 'BID_ACCEPTED'
  | 'BID_REJECTED'
  | 'JOINED'
  | 'LEFT'
  | 'PONG'

interface WSMessage {
  type: MessageType
  data?: any
  room?: string
}

interface UseBidsSocketOptions {
  gigId?: string
  asArtist?: boolean
  onBidPlaced?: (bid: any) => void
  onBidUpdated?: (bid: any) => void
  onOutbid?: (data: { gigId: string; lowestAmount: number }) => void
  onBidAccepted?: (bid: any) => void
  onBidRejected?: (bid: any) => void
}

// Singleton WebSocket manager to prevent multiple connections
let globalWs: WebSocket | null = null
let globalWsListeners: Set<(message: WSMessage) => void> = new Set()
let globalWsReconnectTimeout: NodeJS.Timeout | null = null
let globalWsConnecting = false

function getOrCreateWebSocket(): WebSocket | null {
  if (globalWs?.readyState === WebSocket.OPEN) {
    return globalWs
  }

  if (globalWsConnecting) {
    return null
  }

  if (globalWs?.readyState === WebSocket.CONNECTING) {
    return globalWs
  }

  globalWsConnecting = true

  try {
    const ws = new WebSocket(WS_URL)
    globalWs = ws

    ws.onopen = () => {
      console.log('[WS] Connected')
      globalWsConnecting = false
    }

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data)
        globalWsListeners.forEach((listener) => listener(message))
      } catch (e) {
        console.error('[WS] Failed to parse message:', e)
      }
    }

    ws.onclose = () => {
      console.log('[WS] Disconnected')
      globalWsConnecting = false
      globalWs = null

      // Only reconnect if there are active listeners and page is visible
      if (globalWsListeners.size > 0 && document.visibilityState === 'visible') {
        if (globalWsReconnectTimeout) {
          clearTimeout(globalWsReconnectTimeout)
        }
        globalWsReconnectTimeout = setTimeout(() => {
          getOrCreateWebSocket()
        }, 5000)
      }
    }

    ws.onerror = () => {
      globalWsConnecting = false
    }

    return ws
  } catch (e) {
    globalWsConnecting = false
    console.error('[WS] Connection error:', e)
    return null
  }
}

function sendMessage(type: string, payload?: any) {
  if (globalWs?.readyState === WebSocket.OPEN) {
    globalWs.send(JSON.stringify({ type, payload }))
  }
}

export function useBidsSocket(options: UseBidsSocketOptions = {}) {
  const { gigId, asArtist = false } = options
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Store callbacks in refs to avoid dependency issues
  const callbacksRef = useRef(options)
  callbacksRef.current = options

  const [isConnected, setIsConnected] = useState(false)
  const joinedRoomsRef = useRef<Set<string>>(new Set())

  const handleMessage = useCallback((message: WSMessage) => {
    const { onBidPlaced, onBidUpdated, onOutbid, onBidAccepted, onBidRejected } = callbacksRef.current

    switch (message.type) {
      case 'BID_PLACED':
        if (message.data?.gigId) {
          queryClient.invalidateQueries({ queryKey: ['bids', 'gig', message.data.gigId] })
          queryClient.invalidateQueries({ queryKey: ['gig', message.data.gigId] })
        }
        onBidPlaced?.(message.data)
        break

      case 'BID_UPDATED':
        if (message.data?.gigId) {
          queryClient.invalidateQueries({ queryKey: ['bids', 'gig', message.data.gigId] })
        }
        onBidUpdated?.(message.data)
        break

      case 'NEW_LOWER_BID':
        queryClient.invalidateQueries({ queryKey: ['bids', 'my'] })
        queryClient.invalidateQueries({ queryKey: ['bidStatus'] })
        if (message.data) {
          toast('You have been outbid! Update your bid to stay competitive.', {
            icon: '⚠️',
            duration: 5000,
          })
          onOutbid?.(message.data)
        }
        break

      case 'BID_ACCEPTED':
        queryClient.invalidateQueries({ queryKey: ['bids', 'my'] })
        toast.success('Congratulations! Your bid was accepted!')
        onBidAccepted?.(message.data)
        break

      case 'BID_REJECTED':
        queryClient.invalidateQueries({ queryKey: ['bids', 'my'] })
        toast('Your bid was not selected for this gig.', { icon: '😔' })
        onBidRejected?.(message.data)
        break

      case 'BID_STATUS_UPDATED':
        if (message.data?.gigId) {
          queryClient.invalidateQueries({ queryKey: ['bids', 'gig', message.data.gigId] })
          queryClient.invalidateQueries({ queryKey: ['gig', message.data.gigId] })
        }
        break

      case 'JOINED':
        setIsConnected(true)
        break

      case 'PONG':
        break
    }
  }, [queryClient])

  // Register/unregister message listener
  useEffect(() => {
    globalWsListeners.add(handleMessage)
    getOrCreateWebSocket()

    // Check connection status
    const checkConnection = () => {
      setIsConnected(globalWs?.readyState === WebSocket.OPEN)
    }
    const interval = setInterval(checkConnection, 1000)

    return () => {
      globalWsListeners.delete(handleMessage)
      clearInterval(interval)

      // If no more listeners, close the connection
      if (globalWsListeners.size === 0) {
        if (globalWsReconnectTimeout) {
          clearTimeout(globalWsReconnectTimeout)
        }
        globalWs?.close()
        globalWs = null
      }
    }
  }, [handleMessage])

  // Join rooms when connected
  useEffect(() => {
    if (!isConnected) return

    const roomsToJoin: string[] = []

    if (gigId) {
      const roomType = asArtist ? 'JOIN_GIG_AS_ARTIST' : 'JOIN_GIG'
      const roomKey = `${roomType}:${gigId}`
      if (!joinedRoomsRef.current.has(roomKey)) {
        sendMessage(roomType, { gigId })
        joinedRoomsRef.current.add(roomKey)
        roomsToJoin.push(roomKey)
      }
    }

    if (user?.id) {
      const roomKey = `JOIN_USER:${user.id}`
      if (!joinedRoomsRef.current.has(roomKey)) {
        sendMessage('JOIN_USER', { userId: user.id })
        joinedRoomsRef.current.add(roomKey)
        roomsToJoin.push(roomKey)
      }
    }

    return () => {
      // Leave rooms on cleanup
      if (gigId) {
        sendMessage('LEAVE_GIG', { gigId })
        joinedRoomsRef.current.delete(`JOIN_GIG:${gigId}`)
        joinedRoomsRef.current.delete(`JOIN_GIG_AS_ARTIST:${gigId}`)
      }
    }
  }, [isConnected, gigId, asArtist, user?.id])

  // Handle visibility change - reconnect when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-establish connection if needed
        if (globalWs?.readyState !== WebSocket.OPEN && globalWsListeners.size > 0) {
          getOrCreateWebSocket()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Heartbeat
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      sendMessage('PING')
    }, 30000)

    return () => clearInterval(interval)
  }, [isConnected])

  const send = useCallback((type: string, payload?: any) => {
    sendMessage(type, payload)
  }, [])

  return {
    isConnected,
    send,
  }
}
