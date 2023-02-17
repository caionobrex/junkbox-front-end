/* eslint-disable consistent-return */
/* eslint-disable no-nested-ternary */
import {
  AppBar,
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Fab,
  Icon,
  IconButton,
  Snackbar,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material'
import { NextPage } from 'next'
import Router, { NextRouter, useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'
import useSocket from '@/hooks/useSocket'
import { usePlayerStore } from '@/components/Player'
import useUser from '@/hooks/dataHooks/useUser'
import usePlaylistTracks from '@/hooks/dataHooks/usePlaylistTracks'
import usePlaylistById from '@/hooks/dataHooks/usePlaylistById'

interface Track {
  id: number
  name: string
  externalId: string
  image: string
  upvoteCount: number
  addedBy: {
    name: string
  }
  position: number
  anonymous: boolean
  duration: number
  playlistId: number
}

function PlaylistItemCard({
  track,
  onUpVote,
}: {
  track: Track
  onUpVote: any
}) {
  const theme = useTheme()
  const { currentTrack } = usePlayerStore()

  return (
    <Card sx={{ display: 'flex' }}>
      <Box sx={{ width: 151 }}>
        <CardMedia
          component="img"
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          image={track.image}
          alt="Live from space album cover"
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardContent sx={{ flex: '1 0 auto', margin: 0 }}>
          <Typography
            component="div"
            variant="h6"
            className="line-clamp-2"
            sx={{ fontSize: 14 }}
          >
            {track.name}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
          >
            Adicionada por: {track.addedBy?.name}
          </Typography>
        </CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            pb: 1,
          }}
        >
          <Box sx={{ display: 'flex', columnGap: 1 }}>
            {currentTrack?.id === track.id ? (
              <Box
                sx={{ display: 'flex', alignItems: 'center', columnGap: 0.5 }}
              >
                <Icon sx={{ color: theme.palette.primary.main }}>
                  pause_arrow
                </Icon>
              </Box>
            ) : (
              <Typography>
                Posição:{' '}
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {track.position}
                </Box>
              </Typography>
            )}
          </Box>
          <Box>
            <IconButton onClick={() => onUpVote(track.id)}>
              <Icon sx={{ color: theme.palette.primary.main }}>
                keyboard_arrow_up
              </Icon>
            </IconButton>
            <Typography component="span" sx={{ fontWeight: 700 }}>
              {track.upvoteCount}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

const PlayList: NextPage = (): JSX.Element => {
  const router: NextRouter = useRouter()
  const [playlist] = usePlaylistById(
    typeof router.query.id === 'string' ? router.query.id : ''
  )
  const [tracks, loading, error] = usePlaylistTracks(
    typeof router.query.id === 'string' ? router.query.id : ''
  )
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false)
  const { socket } = useSocket()
  const [user, loadingUser] = useUser()
  const [isSnackBarOpen, setIsSnackBarOpen] = useState<boolean>(false)
  const player = usePlayerStore()
  const { mutate } = useSWRConfig()

  const handleUpVote = (trackId: number) => {
    socket?.emit('upVoteTrack', { playlistId: router.query.id, trackId })
  }

  const onUpVote = useCallback(
    (trackId: number, upVoteCount: number) => {
      mutate(
        `/playlists/${router.query.id}/tracks`,
        (current: Track[]) => {
          current = current
            .map((track: Track) => {
              if (track.id === trackId) {
                track.upvoteCount = upVoteCount
              }
              return track
            })
            .sort((a, b) =>
              a.upvoteCount > b.upvoteCount
                ? -1
                : a.upvoteCount === b.upvoteCount && a.id < b.id
                ? -1
                : 1
            )
          player.setTracks(current)
          return current
        },
        { revalidate: false }
      )
    },
    [router, mutate]
  )

  const addTrackHandler = useCallback(
    (track: any) => {
      mutate(
        `/playlists/${router.query.id}/tracks`,
        (current: Track[]) => [...current, track],
        { revalidate: false }
      )
      setShowSnackbar(true)
    },
    [router, mutate]
  )

  const deleteTrack = useCallback(
    (_playlistId: number, trackId: number) => {
      mutate(
        `/playlists/${router.query.id}/tracks`,
        (current: Track[]) =>
          current
            .filter((track: Track) => track.id !== trackId)
            .sort((a: Track, b: Track) =>
              a.upvoteCount > b.upvoteCount
                ? -1
                : a.upvoteCount === b.upvoteCount && a.id < b.id
                ? -1
                : 1
            ),
        { revalidate: false }
      )
    },
    [router, mutate]
  )

  const playTrackHandler = useCallback(
    (track: Track, trackPosition: number) => {
      if (!loadingUser && user.id !== player.playlist?.user.id) {
        player.setCurrentTrack({ ...track, position: trackPosition })
      }
    },
    [user, loadingUser, player]
  )

  const onUpVoteTrackErrorHandler = useCallback(() => {
    setIsSnackBarOpen(true)
  }, [setIsSnackBarOpen])

  useEffect(() => {
    if (!socket || !router.isReady) return
    socket?.emit('joinPlaylist', { playlistId: router.query.id })
    socket?.on('addTrack', addTrackHandler)
    socket?.on('deleteTrack', deleteTrack)
    socket?.on('upVoteTrack', onUpVote)
    socket?.on('upVoteTrackError', onUpVoteTrackErrorHandler)
    socket?.on('playTrack', playTrackHandler)
    return () => {
      socket.off('upVoteTrack', onUpVote)
      socket.off('addTrack', addTrackHandler)
      socket.off('deleteTrack', deleteTrack)
      socket?.off('upVoteTrackError', onUpVoteTrackErrorHandler)
      socket?.off('playTrack', playTrackHandler)
    }
  }, [socket, router, player.playlist])

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => router.back()}
          >
            <Icon>arrow_back</Icon>
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Playlist
          </Typography>
          {!loading && playlist && playlist.userId === user.id && (
            <IconButton
              onClick={() => {
                if (tracks.length === 0) return
                player.setPlaylist(playlist)
                player.setTracks(tracks)
                player.setCurrentTrack({ ...tracks[0], position: 0 })
                if (socket?.connected) {
                  socket?.emit('playTrack', {
                    trackId: tracks[0].id,
                    trackPosition: 0,
                  })
                }
                player.toggle()
              }}
            >
              {player.isPlaying ? (
                <Icon>pause_arrow</Icon>
              ) : (
                <Icon>play_arrow</Icon>
              )}
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: 'flex',
          mt: 8,
          pt: { lg: 2 },
          pb: 16,
          flexDirection: 'column',
          rowGap: 1,
          maxWidth: '28rem',
          marginInline: 'auto',
        }}
      >
        {loading || error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 5 }}>
            <CircularProgress />
          </Box>
        ) : tracks.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 3 }}>
            Playlist vazia
          </Typography>
        ) : (
          <>
            {tracks
              // .filter((track: Track) =>
              //   tracks.length === 1
              //     ? true
              //     : player.currentTrack
              //     ? track.id !== player.currentTrack.id
              //     : true
              // )
              .map((track: Track, index: number) => (
                <PlaylistItemCard
                  key={track.id}
                  track={{ ...track, position: index + 1 }}
                  onUpVote={handleUpVote}
                />
              ))}
          </>
        )}
      </Box>
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 65, right: 20 }}
        onClick={() => Router.push(`/${Router.query.id}/add-track`)}
      >
        <Icon>add</Icon>
      </Fab>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={2000}
        onClose={() => setShowSnackbar(false)}
        message="Nova musica adicionada a playlist."
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      <Snackbar
        open={isSnackBarOpen}
        autoHideDuration={3000}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        onClose={() => setIsSnackBarOpen(false)}
        message="Voce não pode dar upvote duas vezes na mesma música."
      />
    </>
  )
}

export default PlayList
