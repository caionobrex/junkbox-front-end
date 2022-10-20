import { Box, Icon, IconButton, Typography, useTheme } from '@mui/material'
import Image from 'next/image'
import { createRef, useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import create from 'zustand'

interface Track {
  id: number
  name: string
  externalId: string
  upvoteCount: number
  addedBy: {
    name: string
  }
  position: number
  anonymous: boolean
  duration: number
}

interface PlayerState {
  currentTrack: Track | null
  currentTime: number
  playlist: Track[]
  isPlaying: boolean
  setCurrentTrack: (currentTrack: Track) => void
  setPlaylist: (playlist: Track[]) => void
  setCurrentTime: (currentTime: number) => void
  play: () => void
  pause: () => void
  toggle: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  currentTime: 0,
  isPlaying: false,
  playlist: [],
  setCurrentTrack: (currentTrack: Track) => set(() => ({ currentTrack })),
  play: () => set(() => ({ isPlaying: true })),
  pause: () => set(() => ({ isPlaying: false })),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (currentTime: number) => set(() => ({ currentTime })),
  setPlaylist: (playlist: Track[]) => set(() => ({ playlist })),
}))

export default function Player(): JSX.Element {
  const [hasWindow, setHasWindow] = useState<boolean>(false)
  const player = usePlayerStore()
  const theme = useTheme()
  const ref = createRef<ReactPlayer>()

  const toggle = useCallback(() => {
    if (player.isPlaying) player.pause()
    else player.play()
  }, [player])

  const skipTo = useCallback(
    (valueInSeconds: number) => () => {
      if (!ref.current) return
      ref.current.seekTo(valueInSeconds)
    },
    [ref]
  )

  const previousOne = useCallback(() => {
    if (!player.currentTrack) return
    if (player?.currentTrack?.position === 0) return
    player.setCurrentTrack(player.playlist[player.currentTrack.position - 1])
  }, [player])

  const nextOne = useCallback(() => {
    if (!player.currentTrack) return
    if (player?.currentTrack?.position === player.playlist.length - 1) return
    player.setCurrentTrack(player.playlist[player.currentTrack.position + 1])
  }, [player])

  const handleOnEnd = useCallback(() => {
    if (!player.currentTrack) return
    if (player.currentTrack.position === player.playlist.length - 1) return
    player.setCurrentTrack(player.playlist[player.currentTrack.position + 1])
  }, [player])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true)
    }
    player.setPlaylist([
      {
        name: 'Test',
        externalId: 'VHoT4N43jK8',
        position: 0,
        duration: 200,
      },
      {
        name: 'Test',
        externalId: 'fSjkMXxdwvs',
        position: 1,
        duration: 200,
      },
    ])
    player.setCurrentTrack({
      name: 'Test',
      externalId: 'VHoT4N43jK8',
      position: 0,
      duration: 200,
    })
  }, [])

  return (
    <Box
      sx={{
        position: 'fixed',
        width: '100%',
        bottom: 0,
        left: 0,
        backgroundColor: theme.palette.grey[100],
      }}
    >
      {hasWindow && (
        <Box sx={{ position: 'absolute', top: 0, zIndex: -1, opacity: 0 }}>
          <ReactPlayer
            width="100%"
            height="100%"
            url={`https://www.youtube.com/watch?v=${player.currentTrack?.externalId}`}
            onEnded={handleOnEnd}
            volume={1}
            onProgress={(progress) =>
              player.setCurrentTime(progress.playedSeconds)
            }
            playing={player.isPlaying}
            ref={ref}
            controls
          />
        </Box>
      )}
      {player.currentTrack && (
        <Box
          sx={{
            height: '2px',
            backgroundColor: theme.palette.primary.main,
            width: `${
              (player.currentTime / player.currentTrack.duration) * 100
            }%`,
          }}
        />
      )}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          columnGap: 1,
        }}
      >
        <Box>
          <Image
            src="https://i.ytimg.com/vi/JWA5hJl4Dv0/default.jpg"
            width="70px"
            height="50px"
          />
        </Box>
        <Typography>{player.currentTrack?.name}</Typography>
        <IconButton onClick={toggle}>
          <Icon>play_arrow</Icon>
        </IconButton>
      </Box>
    </Box>
  )
}
