import { Box, Icon, IconButton, Typography, useTheme } from '@mui/material'
import { createRef, useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import create from 'zustand'

interface Track {
  id: number
  name: string
  image?: string
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
  setPlaylist: (playlist: Track[]) =>
    set(() => ({ playlist: playlist.map((p, i) => ({ ...p, position: i })) })),
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

  // const skipTo = useCallback(
  //   (valueInSeconds: number) => () => {
  //     if (!ref.current) return
  //     ref.current.seekTo(valueInSeconds)
  //   },
  //   [ref]
  // )

  // const previousOne = useCallback(() => {
  //   if (!player.currentTrack) return
  //   if (player?.currentTrack?.position === 0) return
  //   player.setCurrentTrack(player.playlist[player.currentTrack.position - 1])
  // }, [player])

  // const nextOne = useCallback(() => {
  //   if (!player.currentTrack) return
  //   if (player?.currentTrack?.position === player.playlist.length - 1) return
  //   player.setCurrentTrack(player.playlist[player.currentTrack.position + 1])
  // }, [player])

  const handleOnEnd = useCallback(() => {
    if (!player.currentTrack) return
    if (player.currentTrack.position === player.playlist.length - 1) return
    player.setCurrentTrack(player.playlist[player.currentTrack.position + 1])
    // TODO - EMMIT EVENT TO REMOVE SONG FROM PLAYLIST
  }, [player])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true)
    }
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
          justifyContent: 'space-between',
          columnGap: 1,
        }}
      >
        <Box sx={{ display: 'flex', columnGap: 1 }}>
          <Box sx={{ display: 'flex', width: '5rem', height: '3rem' }}>
            <img
              src={
                player.currentTrack?.image ||
                'https://i.ytimg.com/vi/JWA5hJl4Dv0/default.jpg'
              }
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              alt=""
            />
          </Box>
          <Box sx={{ maxWidth: '14rem', alignSelf: 'center' }}>
            <Typography className="line-clamp-1">
              {player.currentTrack?.name}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={toggle} sx={{ mr: 1 }}>
          {player.isPlaying ? (
            <Icon sx={{ color: theme.palette.primary.main }}>pause_arrow</Icon>
          ) : (
            <Icon sx={{ color: theme.palette.primary.main }}>play_arrow</Icon>
          )}
        </IconButton>
        {/* <button type="button" onClick={previousOne}>
          previus
        </button>
        <button type="button" onClick={nextOne}>
          ds
        </button>
        <button type="button" onClick={skipTo(200)}>
          skip
        </button> */}
      </Box>
    </Box>
  )
}
