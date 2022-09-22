import {
  AppBar,
  Box,
  Card,
  CardContent,
  CardMedia,
  Fab,
  Icon,
  Toolbar,
  Typography,
} from '@mui/material'
import { NextPage } from 'next'
import Router from 'next/router'

function PlaylistItemCard() {
  return (
    <Card sx={{ display: 'flex' }} onClick={() => Router.push('/test')}>
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image="https://mui.com/static/images/cards/live-from-space.jpg"
        alt="Live from space album cover"
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h6">
            JunkBox Playlist
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
          >
            Mac Miller
          </Typography>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pb: 1 }}>
          <Typography>items: 2</Typography>
        </Box>
      </Box>
    </Card>
  )
}

const PlayList: NextPage = (): JSX.Element => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Playlist
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', mt: 2, flexDirection: 'column', rowGap: 1 }}>
        <PlaylistItemCard />
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 36, right: 20 }}
        onClick={() => Router.push(`/${Router.query.id}/add-song`)}
      >
        <Icon>add</Icon>
      </Fab>
    </>
  )
}

export default PlayList
