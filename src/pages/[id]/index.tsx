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
import { useEffect, useState } from 'react'
import { AxiosResponse } from 'axios'
import useSocket from '@/hooks/useSocket'
import api from '@/services/api'
import useUser from '@/hooks/dataHooks/useUser'
import { usePlayerStore } from '@/components/Player'

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
            Mac Miller
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
          >
            Adicionada por: {track.addedBy.name}
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
            -
            <Typography>
              Votos:{' '}
              <Box component="span" sx={{ fontWeight: 700 }}>
                {track.upvoteCount}
              </Box>
            </Typography>
          </Box>
          <IconButton onClick={() => onUpVote(track.id)}>
            <Icon sx={{ color: theme.palette.primary.main }}>
              keyboard_arrow_up
            </Icon>
          </IconButton>
        </Box>
      </Box>
    </Card>
  )
}

const PlayList: NextPage = (): JSX.Element => {
  const [playlist, setPlaylist] = useState<any>(null)
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false)
  const { socket, connected } = useSocket()
  const router: NextRouter = useRouter()
  const player = usePlayerStore()
  const [user, loading] = useUser()

  const handleUpVote = (trackId: number) => {
    socket?.emit('upVoteTrack', { playlistId: router.query.id, trackId })
  }

  useEffect(() => {
    if (!socket || !connected || !router.isReady) return
    socket?.emit('joinPlaylist', { playlistId: router.query.id })
    socket?.on('addTrack', (track: any) => {
      setPlaylist((current: Track[]) => [...current, track])
      setShowSnackbar(true)
    })
    socket?.on('removeTrack', () => {})
    socket?.on('upVoteTrack', (trackId: number, upVoteCount: number) => {
      setPlaylist((current: Track[]) =>
        current.map((track: Track) => {
          if (track.id === trackId) {
            track.upvoteCount = upVoteCount
          }
          return track
        })
      )
    })
  }, [socket, connected, router])

  useEffect(() => {
    if (!router.isReady) return
    api.get(`/playlists/${router.query.id}`).then((res: AxiosResponse) => {
      setPlaylist(res.data)
    })
  }, [router])

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Playlist
          </Typography>
          {!loading && user && playlist && user.id === playlist.userId && (
            <IconButton
              onClick={() => {
                player.setPlaylist(playlist.tracks)
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
          pb: 10,
          flexDirection: 'column',
          rowGap: 1,
          maxWidth: '28rem',
          marginInline: 'auto',
        }}
      >
        {playlist?.tracks
          .sort((a, b) => (a.upvoteCount > b.upvoteCount ? -1 : 1))
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  )
}

export default PlayList
