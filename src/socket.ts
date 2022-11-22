import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

// test

export default function getSocket(token: string | null): Socket | null {
  if (socket) return socket
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
    extraHeaders: { Authorization: `${token}` },
  })
  return socket
}
