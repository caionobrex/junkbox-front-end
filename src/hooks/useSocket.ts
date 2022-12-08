import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import getSocket from '@/socket'

export default function useSocket(): {
  socket: Socket | null
  connected: boolean
} {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState<boolean>(false)

  useEffect(() => {
    if (!socket) setSocket(getSocket(localStorage.getItem('token')))
  }, [socket])

  useEffect(() => {
    socket?.on('connect', () => {
      setConnected(true)
    })
    socket?.on('disconnect', () => {
      // setConnected(false)
    })
  }, [socket])

  return { socket, connected }
}
