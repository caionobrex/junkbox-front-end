/* eslint-disable consistent-return */
import { Box, Icon, IconButton, Typography, useTheme } from '@mui/material'
import { createRef, useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import create from 'zustand'
import useSocket from '@/hooks/useSocket'

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
  playlistId: number
}

interface PlayerState {
  currentTrack: Track | null
  currentTime: number
  playlistId: number | null
  playlist: Track[]
  isPlaying: boolean
  setPlaylistId: (playlistId: number) => void
  setCurrentTrack: (currentTrack: Track) => void
  setPlaylist: (playlist: Track[]) => void
  setCurrentTime: (currentTime: number) => void
  deleteTrack: (trackId: number) => void
  play: () => void
  pause: () => void
  toggle: () => void
  addTrack: (track: Track) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  currentTime: 0,
  isPlaying: false,
  playlistId: null,
  playlist: [],
  setPlaylistId: (playlistId: number) => set(() => ({ playlistId })),
  setCurrentTrack: (currentTrack: Track) => set(() => ({ currentTrack })),
  addTrack: (track: Track) =>
    set(({ playlist }) => ({
      playlist: [...playlist, track].sort((a, b) =>
        a.upvoteCount > b.upvoteCount ? -1 : 1
      ),
    })),
  deleteTrack: (trackId: number) =>
    set(({ playlist }) => ({
      playlist: playlist
        .filter((track) => track.id !== trackId)
        .sort((a, b) => (a.upvoteCount > b.upvoteCount ? -1 : 1)),
    })),
  play: () => set(() => ({ isPlaying: true })),
  pause: () => set(() => ({ isPlaying: false })),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (currentTime: number) => set(() => ({ currentTime })),
  setPlaylist: (playlist: Track[]) =>
    set(() => ({ playlist: playlist.map((p, i) => ({ ...p, position: i })) })),
}))

export default function Player(): JSX.Element {
  const [hasWindow, setHasWindow] = useState<boolean>(false)
  const { socket } = useSocket()
  const player = usePlayerStore()
  const theme = useTheme()
  const ref = createRef<ReactPlayer>()

  const toggle = useCallback(() => {
    if (player.isPlaying) player.pause()
    else player.play()
  }, [player])

  const skipTo = useCallback(
    () => () => {
      if (!ref.current) return
      if (player.currentTrack)
        ref.current.seekTo(player.currentTrack.duration - 4)
    },
    [ref, player]
  )

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
    if (socket) {
      socket?.emit('deleteTrack', {
        playlistId: player.playlistId,
        trackId: player.currentTrack.id,
      })
    }
    player.setCurrentTrack(player.playlist[player.currentTrack.position + 1])
  }, [player, socket])

  const onDeleteTrack = useCallback(
    (_playlistId: number, trackId: number) => player.deleteTrack(trackId),
    []
  )

  const onAddTrack = useCallback((track: Track) => {
    player.addTrack(track)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true)
    }
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('addTrack', onAddTrack)
    socket.on('deleteTrack', onDeleteTrack)
    return () => {
      socket.off('addTrack', onAddTrack)
      socket.off('deleteTrack', onDeleteTrack)
    }
  }, [socket])

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
        <button type="button" onClick={skipTo()}>
          dsa
        </button>
      </Box>
    </Box>
  )
}
