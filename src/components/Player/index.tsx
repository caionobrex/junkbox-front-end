/* eslint-disable consistent-return */
import { Box, Icon, IconButton, Typography, useTheme } from '@mui/material'
import { createRef, useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import create from 'zustand'
import useSocket from '@/hooks/useSocket'
import useUser from '@/hooks/dataHooks/useUser'

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

interface User {
  id: number
  email: string
  name: string
  avatar: string | null
  ip: string
  allowDedication: boolean
  createdAt: string
  updatedAt: string
}

interface Playlist {
  id: number
  image: string | null
  name: string
  maxLength: number
  description: string
  tracksCount: number
  user: User
  userId: number
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

interface PlayerState {
  currentTrack: Track | null
  currentTime: number
  playlist: Playlist | null
  tracks: Track[]
  isPlaying: boolean
  setPlaylist: (playlist: Playlist) => void
  setCurrentTrack: (currentTrack: Track) => void
  setTracks: (tracks: Track[]) => void
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
  playlist: null,
  tracks: [],
  setPlaylist: (playlist: Playlist) => set(() => ({ playlist })),
  setCurrentTrack: (currentTrack: Track) => set(() => ({ currentTrack })),
  addTrack: (track: Track) =>
    set(({ tracks }) => ({
      tracks: [...tracks, track].sort((a, b) =>
        a.upvoteCount > b.upvoteCount ? -1 : 1
      ),
    })),
  deleteTrack: (trackId: number) =>
    set(({ tracks }) => ({
      tracks: tracks
        .filter((track) => track.id !== trackId)
        .sort((a, b) => (a.upvoteCount > b.upvoteCount ? -1 : 1)),
    })),
  play: () => set(() => ({ isPlaying: true })),
  pause: () => set(() => ({ isPlaying: false })),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (currentTime: number) => set(() => ({ currentTime })),
  setTracks: (tracks: Track[]) =>
    set(() => ({ tracks: tracks.map((p, i) => ({ ...p, position: i })) })),
}))

export default function Player(): JSX.Element {
  const [hasWindow, setHasWindow] = useState<boolean>(false)
  const { socket } = useSocket()
  const player = usePlayerStore()
  const theme = useTheme()
  const ref = createRef<ReactPlayer>()
  const [user] = useUser()

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
    if (player.currentTrack.position === player.tracks.length - 1) return
    const nextTrack = player.tracks[player.currentTrack.position + 1]
    if (socket) {
      // socket?.emit('deleteTrack', {
      //   playlistId: player.playlistId,
      //   trackId: player.currentTrack.id,
      // })
      socket?.emit('playTrack', {
        trackId: nextTrack.id,
        trackPosition: nextTrack.position,
      })
    }
    player.setCurrentTrack(nextTrack)
  }, [player, socket])

  const onDeleteTrack = useCallback(
    (_playlistId: number, trackId: number) => player.deleteTrack(trackId),
    []
  )

  const onAddTrack = useCallback(
    (track: Track) => {
      player.addTrack({ ...track, position: player.tracks.length })
    },
    [player.tracks]
  )

  const playTrackHandler = useCallback(
    (track: Track, trackPosition: number) => {
      if (user.id !== player.playlist?.userId)
        player.setCurrentTrack({ ...track, position: trackPosition })
    },
    [user, player.playlist]
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true)
    }
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('addTrack', onAddTrack)
    socket.on('deleteTrack', onDeleteTrack)
    socket?.on('playTrack', playTrackHandler)
    return () => {
      socket.off('addTrack', onAddTrack)
      socket.off('deleteTrack', onDeleteTrack)
      socket?.off('playTrack', playTrackHandler)
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
        {user.id === player.playlist?.userId && (
          <IconButton onClick={toggle} sx={{ mr: 1 }}>
            {player.isPlaying ? (
              <Icon sx={{ color: theme.palette.primary.main }}>
                pause_arrow
              </Icon>
            ) : (
              <Icon sx={{ color: theme.palette.primary.main }}>play_arrow</Icon>
            )}
          </IconButton>
        )}
        {/* <button type="button" onClick={previousOne}>
          previus
        </button>
        <button type="button" onClick={nextOne}>
          ds
        </button>
        <button type="button" onClick={skipTo(200)}>
          skip
        </button> */}
        {user.id === player.playlist?.userId && (
          <button type="button" onClick={skipTo()}>
            dsa
          </button>
        )}
      </Box>
    </Box>
  )
}
