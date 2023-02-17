/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
import {
  Box,
  Icon,
  IconButton,
  Slider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
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
        a.upvoteCount > b.upvoteCount
          ? -1
          : a.upvoteCount === b.upvoteCount && a.id < b.id
          ? -1
          : 1
      ),
    })),
  deleteTrack: (trackId: number) =>
    set(({ tracks }) => ({
      tracks: tracks
        .filter((track) => track.id !== trackId)
        .map((t, i) => ({ ...t, position: i }))
        .sort((a, b) =>
          a.upvoteCount > b.upvoteCount
            ? -1
            : a.upvoteCount === b.upvoteCount && a.id < b.id
            ? -1
            : 1
        ),
    })),
  play: () => set(() => ({ isPlaying: true })),
  pause: () => set(() => ({ isPlaying: false })),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (currentTime: number) => set(() => ({ currentTime })),
  setTracks: (tracks: Track[]) =>
    set(() => ({ tracks: tracks.map((p, i) => ({ ...p, position: i })) })),
}))

function ExpandedPlayer({
  skipTo,
  nextOne,
  previousOne,
  toggle,
  close,
}: {
  skipTo: (value: number) => void
  nextOne: () => void
  previousOne: () => void
  toggle: () => void
  close: () => void
}): JSX.Element {
  const player = usePlayerStore()
  const theme = useTheme()

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'white',
        zIndex: 999999,
      }}
    >
      <Box sx={{ pt: 2, px: 2, maxWidth: '400px', mx: 'auto' }}>
        <IconButton onClick={close}>
          <Icon>expand_more</Icon>
        </IconButton>
      </Box>
      <Box sx={{ pt: 10, px: 4, maxWidth: '400px', mx: 'auto' }}>
        <Box sx={{ height: '10rem' }}>
          <img
            src={player.currentTrack?.image}
            alt=""
            width="100%"
            height="100%"
            style={{ objectFit: 'cover', borderRadius: '1rem' }}
          />
        </Box>
        <Typography sx={{ mt: 1 }} className="line-clamp-1">
          {player.currentTrack?.name}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
            columnGap: 3,
          }}
        >
          <IconButton onClick={previousOne}>
            <Icon>skip_previous</Icon>
          </IconButton>
          <IconButton onClick={toggle}>
            {player.isPlaying ? (
              <Icon sx={{ color: theme.palette.primary.main }}>
                pause_arrow
              </Icon>
            ) : (
              <Icon sx={{ color: theme.palette.primary.main }}>play_arrow</Icon>
            )}
          </IconButton>
          <IconButton onClick={nextOne}>
            <Icon>skip_next</Icon>
          </IconButton>
        </Box>
        <Box>
          <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center">
            <Slider
              aria-label="Volume"
              step={0.1}
              value={
                player.currentTrack
                  ? (player.currentTime / player.currentTrack.duration) * 100
                  : 0
              }
              onChange={(event: any) => {
                if (!event.target || !player.currentTrack) return
                skipTo(
                  (event.target.value / 100) * player.currentTrack.duration
                )
              }}
            />
          </Stack>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              component="span"
              sx={{ fontWeight: '500', color: theme.palette.grey[800] }}
            >
              {player.currentTrack
                ? `${Math.floor(player.currentTime / 60)}:${
                    player.currentTime % 60 < 10
                      ? `0${(player.currentTime % 60).toFixed()}`
                      : (player.currentTime % 60).toFixed()
                  }`
                : '00:00'}
            </Typography>
            <Typography
              component="span"
              sx={{ fontWeight: '500', color: theme.palette.grey[600] }}
            >
              {player.currentTrack
                ? `${Math.floor(player.currentTrack.duration / 60)}:${
                    player.currentTrack.duration % 60
                  }`
                : '00:00'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function Player(): JSX.Element {
  const [hasWindow, setHasWindow] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { socket } = useSocket()
  const player = usePlayerStore()
  const theme = useTheme()
  const ref = createRef<ReactPlayer>()
  const [user, loadingUser] = useUser()

  const toggle = useCallback(() => {
    if (player.isPlaying) player.pause()
    else player.play()
  }, [player])

  const skipTo = useCallback(
    (value: number) => {
      if (!ref.current) return
      if (player.currentTrack) {
        ref.current.seekTo(value)
        player.setCurrentTime(value)
      }
    },
    [ref, player.currentTrack]
  )

  const previousOne = useCallback(() => {
    if (!player.currentTrack) return
    if (player?.currentTrack?.position === 0) return
    const previousTrack: Track = player.tracks[player.currentTrack.position - 1]
    player.setCurrentTrack(previousTrack)
    if (socket)
      socket.emit('playTrack', {
        trackId: previousTrack.id,
        trackPosition: previousTrack.position,
      })
  }, [player.tracks, player.currentTrack, player.setCurrentTrack, socket])

  const nextOne = useCallback(() => {
    if (!player.currentTrack) return
    if (player?.currentTrack?.position === player.tracks.length - 1) return
    const nextTrack: Track = player.tracks[player.currentTrack.position + 1]
    player.setCurrentTrack(nextTrack)
    if (socket)
      socket.emit('playTrack', {
        trackId: nextTrack.id,
        trackPosition: nextTrack.position,
      })
  }, [player.tracks, player.currentTrack, player.setCurrentTrack, socket])

  const handleOnEnd = useCallback(() => {
    if (!player.currentTrack) return
    if (player.currentTrack.position === player.tracks.length - 1) return
    player.setCurrentTime(0)
    const nextTrack = player.tracks[player.currentTrack.position + 1]
    if (socket && player.playlist) {
      socket?.emit('deleteTrack', {
        playlistId: player.playlist.id,
        trackId: player.currentTrack.id,
      })
      socket?.emit('playTrack', {
        trackId: nextTrack.id,
        trackPosition: nextTrack.position,
      })
    }
    player.setCurrentTrack(nextTrack)
  }, [
    player.currentTrack,
    player.tracks,
    player.playlist,
    player.setCurrentTime,
    player.setCurrentTrack,
    socket,
  ])

  const onDeleteTrack = useCallback(
    (_playlistId: number, trackId: number) => player.deleteTrack(trackId),
    []
  )

  const onAddTrack = useCallback(
    (track: Track) => {
      player.addTrack({ ...track, position: player.tracks.length - 1 })
    },
    [player.tracks, player.addTrack]
  )

  const playTrackHandler = useCallback(
    (track: Track, trackPosition: number) => {
      if (!loadingUser && user.id !== player.playlist?.user.id) {
        player.setCurrentTrack({ ...track, position: trackPosition })
      }
    },
    [user, loadingUser, player.playlist, player.setCurrentTrack]
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
    socket.on('playTrack', playTrackHandler)
    return () => {
      socket.off('addTrack', onAddTrack)
      socket.off('deleteTrack', onDeleteTrack)
      socket?.off('playTrack', playTrackHandler)
    }
  }, [socket, player.playlist])

  return (
    <>
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={toggle}>
                {player.isPlaying ? (
                  <Icon sx={{ color: theme.palette.primary.main }}>
                    pause_arrow
                  </Icon>
                ) : (
                  <Icon sx={{ color: theme.palette.primary.main }}>
                    play_arrow
                  </Icon>
                )}
              </IconButton>
              <IconButton onClick={() => setIsOpen(true)}>
                <Icon sx={{ color: theme.palette.primary.main }}>
                  expand_less
                </Icon>
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
      {isOpen && (
        <ExpandedPlayer
          skipTo={skipTo}
          nextOne={nextOne}
          previousOne={previousOne}
          toggle={toggle}
          close={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
