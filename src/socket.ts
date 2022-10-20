import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export default function getSocket(token: string | null): Socket | null {
  if (socket) {
    socket.close()
    socket = null
  }
  socket = io('ws://192.168.1.7:3001', {
    extraHeaders: { Authorization: `${token}` },
  })
  return socket
}
