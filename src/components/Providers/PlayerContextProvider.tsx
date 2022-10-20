import { useState } from 'react'
import { PlayerContext } from '@/contexts'

export default function PlayerContextProvider({ children }) {
  const [playlist, setPlaylist] = useState([])

  return (
    <PlayerContext.Provider value={{ playlist }}>
      {children}
    </PlayerContext.Provider>
  )
}
