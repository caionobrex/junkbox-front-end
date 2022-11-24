import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Snackbar,
  Toolbar,
  Typography,
} from '@mui/material'
import { NextPage } from 'next'
import { useCallback, useEffect, useState } from 'react'
import { NextRouter, useRouter } from 'next/router'
import useSocket from '@/hooks/useSocket'
import useUser from '@/hooks/dataHooks/useUser'
import useYoutubeVideos from '@/hooks/dataHooks/useYoutubeVideos'

interface YoutubeItem {
  kind: string
  etag: string
  id: {
    kind: string
    videoId: string
  }
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
      default: {
        url: string
        width: number
        height: number
      }
      medium: {
        url: string
        width: number
        height: number
      }
      high: {
        url: string
        width: number
        height: number
      }
    }
    channelTitle: string
    liveBroadcastContent: string
    publishTime: string
  }
}

function ItemCard({
  item,
  addTrackHandler,
}: {
  item: YoutubeItem
  addTrackHandler: any
}) {
  // const [user, loading] = useUser()

  return (
    <Card
      sx={{ display: 'flex', minHeight: '7rem' }}
      // onClick={() => Router.push(`/${playlist.id}`)}
    >
      <Box sx={{ width: 200 }}>
        <CardMedia
          component="img"
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          image={item.snippet.thumbnails.medium.url}
          alt="Live from space album cover"
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography
            component="div"
            variant="h6"
            sx={{ fontSize: 14 }}
            className="line-clamp-2"
            title={item.snippet.title}
          >
            {item.snippet.title}
          </Typography>
        </CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            pb: 1,
          }}
        >
          <Typography>Audio</Typography>
          <Button
            type="button"
            onClick={addTrackHandler(item.id?.videoId || item.id)}
          >
            add
          </Button>
        </Box>
      </Box>
    </Card>
  )
}

const Songs: NextPage = (): JSX.Element => {
  const [user, loading] = useUser()
  const [searchValue, setSearchValue] = useState<string>('')
  const [tracks, loadingTracks, error] = useYoutubeVideos(searchValue)
  const [msg, setMsg] = useState<string>('')
  const [isSnackBarOpen, setIsSnackBarOpen] = useState<boolean>(false)
  const { socket } = useSocket()
  const router: NextRouter = useRouter()

  // const selectTrackHandler = useCallback(() => {}, [])

  const addTrackHandler = useCallback(
    (videoId: string) => () => {
      if (socket) {
        socket?.emit('addTrack', {
          playlistId: router.query.id,
          externalId: videoId,
        })
      }
    },
    [socket, router]
  )

  const addTrackErrorHandler = useCallback(
    (err: { error: string }) => {
      setMsg(err.error)
      setIsSnackBarOpen(true)
    },
    [setIsSnackBarOpen, setMsg]
  )

  const addTrackSocketHandler = useCallback(() => {
    setMsg('Musica adicionada com sucesso.')
    setIsSnackBarOpen(true)
  }, [setMsg, setIsSnackBarOpen])

  useEffect(() => {
    if (socket) {
      socket.on('addTrackError', addTrackErrorHandler)
      socket.on('addTrack', addTrackSocketHandler)
    }
    return () => {
      socket?.off('addTrackError', addTrackErrorHandler)
      socket?.off('addTrack', addTrackSocketHandler)
    }
  }, [socket])

  useEffect(() => {
    // if (!loading && !user) router.replace('/login')
  }, [user, loading])

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Adicionar Música
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          maxWidth: '28rem',
          marginInline: 'auto',
          pb: 12,
        }}
      >
        <Box border="1px" borderColor="black" borderRadius="999px">
          <form
            action=""
            onSubmit={(event: any) => {
              event.preventDefault()
              setSearchValue(event.target.search.value)
            }}
          >
            <input type="text" id="search" name="search" />
          </form>
        </Box>
        {loadingTracks ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" rowGap={1} mt={2}>
            {tracks &&
              !error &&
              tracks.items.map((item: YoutubeItem) => (
                <ItemCard item={item} addTrackHandler={addTrackHandler} />
              ))}
          </Box>
        )}
        <Snackbar
          open={isSnackBarOpen}
          autoHideDuration={3000}
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          onClose={() => setIsSnackBarOpen(false)}
          message={msg}
        />
      </Box>
    </>
  )
}

export default Songs
