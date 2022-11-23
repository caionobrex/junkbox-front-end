/* eslint-disable consistent-return */
/* eslint-disable no-nested-ternary */
import {
  AppBar,
  Box,
  Card,
  CardContent,
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
import { AxiosResponse } from 'axios'
import useSocket from '@/hooks/useSocket'
import api from '@/services/api'
import { usePlayerStore } from '@/components/Player'
import useUser from '@/hooks/dataHooks/useUser'

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

  return (
    <Card sx={{ display: 'flex', flexDirection: 'row-reverse' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h6">
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
            <Typography>
              Posição:{' '}
              <Box component="span" sx={{ fontWeight: 700 }}>
                {track.position}
              </Box>
            </Typography>
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
  const [playlist, setPlaylist] = useState<any>(null)
  const [tracks, setTracks] = useState<any[]>([])
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false)
  const { socket } = useSocket()
  const [user] = useUser()
  const router: NextRouter = useRouter()
  const player = usePlayerStore()

  const handleUpVote = (trackId: number) => {
    socket?.emit('upVoteTrack', { playlistId: router.query.id, trackId })
  }

  const onUpVote = useCallback((trackId: number, upVoteCount: number) => {
    setTracks((current: Track[]) => {
      current = current
        .map((track: Track) => {
          if (track.id === trackId) {
            track.upvoteCount = upVoteCount
          }
          return track
        })
        .sort((a, b) => (a.upvoteCount > b.upvoteCount ? -1 : 1))
      player.setPlaylist(current)
      return current
    })
  }, [])

  const addTrackHandler = useCallback((track: any) => {
    setTracks((current: Track[]) => [...current, track])
    setShowSnackbar(true)
  }, [])

  const deleteTrack = useCallback((_playlistId: number, trackId: number) => {
    setTracks((current) =>
      current
        .filter((track) => track.id !== trackId)
        .sort((a, b) => (a.upvoteCount > b.upvoteCount ? -1 : 1))
    )
  }, [])

  useEffect(() => {
    if (!socket || !router.isReady) return
    socket?.emit('joinPlaylist', { playlistId: router.query.id })
    socket?.on('addTrack', addTrackHandler)
    socket?.on('deleteTrack', deleteTrack)
    socket?.on('upVoteTrack', onUpVote)
    return () => {
      socket.off('upVoteTrack', onUpVote)
      socket.off('addTrack', addTrackHandler)
      socket.off('deleteTrack', deleteTrack)
    }
  }, [socket, router])

  useEffect(() => {
    if (!router.isReady) return
    Promise.all([
      api.get(`/playlists/${router.query.id}`).then((res: AxiosResponse) => {
        setPlaylist(res.data)
      }),
      api
        .get(`/playlists/${router.query.id}/tracks`)
        .then((res: AxiosResponse) => {
          setTracks(res.data)
        }),
    ])
  }, [router])

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Playlist
          </Typography>
          {playlist && playlist.userId === user.id && (
            <IconButton
              onClick={() => {
                player.setPlaylistId(playlist.id)
                player.setPlaylist(tracks)
                player.setCurrentTrack({ ...tracks[0], position: 0 })
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
        {/* {player.currentTrack &&
          playlist &&
          player.currentTrack.playlistId === playlist.id && (
            <PlaylistItemCard
              track={{ ...tracks[0], name: 'Fixed', position: 1 }}
              onUpVote={() => alert('test')}
            />
          )} */}
        {tracks
          .filter((track: Track) =>
            tracks.length === 1
              ? true
              : player.currentTrack
              ? track.id !== player.currentTrack.id
              : true
          )
          .map((track: Track, index: number) => (
            <PlaylistItemCard
              track={{ ...track, position: index + 1 }}
              onUpVote={handleUpVote}
            />
          ))}
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
    </>
  )
}

export default PlayList
