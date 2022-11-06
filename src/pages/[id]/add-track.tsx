import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Toolbar,
  Typography,
} from '@mui/material'
import { NextPage } from 'next'
import { useCallback, useEffect, useState } from 'react'
import { NextRouter, useRouter } from 'next/router'
import useSocket from '@/hooks/useSocket'
import useUser from '@/hooks/dataHooks/useUser'

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

function ItemCard({ item, addTrackHandler }: { item: YoutubeItem }) {
  const [user, loading] = useUser()

  return (
    <Card
      sx={{ display: 'flex' }}
      // onClick={() => Router.push(`/${playlist.id}`)}
    >
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image={item.snippet.thumbnails.high.url}
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
          <Button type="button" onClick={addTrackHandler(item.id.videoId)}>
            add
          </Button>
        </Box>
      </Box>
    </Card>
  )
}

const Songs: NextPage = (): JSX.Element => {
  const [user, loading] = useUser()
  const [tracks, setTracks] = useState<YoutubeItem[]>([])
  const [searchValue, setSearchValue] = useState([])
  const { socket, connected } = useSocket()
  const router: NextRouter = useRouter()

  const selectTrackHandler = useCallback(() => {}, [])

  const addTrackHandler = useCallback(
    (videoId: string) => () => {
      if (socket && connected) {
        socket?.emit('addTrack', {
          playlistId: router.query.id,
          externalId: videoId,
        })
      }
    },
    [socket, connected, router]
  )

  useEffect(() => {
    // TODO - make request to youtube to retrieve data
    setTracks([
      {
        kind: 'youtube#searchResult',
        etag: 'LIForApwTxnS41faG5p3M7vCpWY',
        id: {
          kind: 'youtube#video',
          videoId: 'M7Z2tgJo8Hg',
        },
        snippet: {
          publishedAt: '2022-03-07T19:00:11Z',
          channelId: 'UCFKo78ysxmRhoQ85ySEo_PQ',
          title: 'Stromae - Fils de joie (Official Music Video)',
          description: `Stromae – Fils de joie Listen to « Mon amour » : https://stromae.lnk.to/monamourxcamila Order my new album « Multitude » here: ...`,
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/M7Z2tgJo8Hg/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/M7Z2tgJo8Hg/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/M7Z2tgJo8Hg/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'StromaeVEVO',
          liveBroadcastContent: 'none',
          publishTime: '2022-03-07T19:00:11Z',
        },
      },
      {
        kind: 'youtube#searchResult',
        etag: 'LIForApwTxnS41faG5p3M7vCpWY',
        id: {
          kind: 'youtube#ideo',
          videoId: 'CW7gfrTlr0Y',
        },
        snippet: {
          publishedAt: '2022-03-07T19:00:11Z',
          channelId: 'UCFKo78ysxmRhoQ85ySEo_PQ',
          title: 'Stromae - Santé | The Tonight Show Starring Jimmy Fallon',
          description: `Stromae – Fils de joie Listen to « Mon amour » : https://stromae.lnk.to/monamourxcamila Order my new album « Multitude » here: ...`,
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/M7Z2tgJo8Hg/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/M7Z2tgJo8Hg/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/M7Z2tgJo8Hg/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'StromaeVEVO',
          liveBroadcastContent: 'none',
          publishTime: '2022-03-07T19:00:11Z',
        },
      },
      {
        kind: 'youtube#searchResult',
        etag: 'LIForApwTxnS41faG5p3M7vCpWY',
        id: {
          kind: 'youtube#video',
          videoId: 'M7Z2tgJo8Hg',
        },
        snippet: {
          publishedAt: '2022-03-07T19:00:11Z',
          channelId: 'UCFKo78ysxmRhoQ85ySEo_PQ',
          title: 'Stromae - Fils de joie (Official Music Video)',
          description: `Stromae – Fils de joie Listen to « Mon amour » : https://stromae.lnk.to/monamourxcamila Order my new album « Multitude » here: ...`,
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/M7Z2tgJo8Hg/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/M7Z2tgJo8Hg/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/M7Z2tgJo8Hg/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'StromaeVEVO',
          liveBroadcastContent: 'none',
          publishTime: '2022-03-07T19:00:11Z',
        },
      },
      {
        kind: 'youtube#searchResult',
        etag: 'LIForApwTxnS41faG5p3M7vCpWY',
        id: {
          kind: 'youtube#video',
          videoId: 'M7Z2tgJo8Hg',
        },
        snippet: {
          publishedAt: '2022-03-07T19:00:11Z',
          channelId: 'UCFKo78ysxmRhoQ85ySEo_PQ',
          title: 'Stromae - Fils de joie (Official Music Video)',
          description: `Stromae – Fils de joie Listen to « Mon amour » : https://stromae.lnk.to/monamourxcamila Order my new album « Multitude » here: ...`,
          thumbnails: {
            default: {
              url: 'https://i.ytimg.com/vi/M7Z2tgJo8Hg/default.jpg',
              width: 120,
              height: 90,
            },
            medium: {
              url: 'https://i.ytimg.com/vi/M7Z2tgJo8Hg/mqdefault.jpg',
              width: 320,
              height: 180,
            },
            high: {
              url: 'https://i.ytimg.com/vi/M7Z2tgJo8Hg/hqdefault.jpg',
              width: 480,
              height: 360,
            },
          },
          channelTitle: 'StromaeVEVO',
          liveBroadcastContent: 'none',
          publishTime: '2022-03-07T19:00:11Z',
        },
      },
    ])
  }, [])

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
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
          <Box component="input" type="text" outline="none" border="none" />
        </Box>

        <Box display="flex" flexDirection="column" rowGap={1} mt={2}>
          {tracks.map((item: YoutubeItem) => (
            <ItemCard item={item} addTrackHandler={addTrackHandler} />
          ))}
        </Box>
      </Box>
    </>
  )
}

export default Songs
