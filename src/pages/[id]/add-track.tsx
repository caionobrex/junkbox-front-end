import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Toolbar,
  Typography,
} from '@mui/material'
import { NextPage } from 'next'
import { useCallback, useEffect } from 'react'
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
      sx={{ display: 'flex' }}
      // onClick={() => Router.push(`/${playlist.id}`)}
    >
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image={item.snippet.thumbnails.medium.url}
        alt="Live from space album cover"
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h6">
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
  // const [searchValue, setSearchValue] = useState<string>('')
  const [tracks, loadingTracks, error] = useYoutubeVideos('')
  const { socket, connected } = useSocket()
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
    [socket, connected, router]
  )

  useEffect(() => {}, [])

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
          {/* <Box component="input" type="text" outline="none" border="none" /> */}
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
      </Box>
    </>
  )
}

export default Songs
