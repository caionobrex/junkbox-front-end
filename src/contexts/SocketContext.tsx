/* eslint-disable react/jsx-no-constructed-context-values */
import { createContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface ISocketContext {
  socket: Socket | null
}

export const SocketContext = createContext<ISocketContext>({ socket: null })

export const SocketProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[]
}) => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (socket) return
    const token = localStorage.getItem('token')
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      auth: { token },
    })
    setSocket(socketInstance)
  }, [socket, setSocket])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}
