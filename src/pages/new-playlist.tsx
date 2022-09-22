import { AppBar, Toolbar, Typography } from '@mui/material'
import { NextPage } from 'next'

const NewPlayList: NextPage = (): JSX.Element => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Criar Playlist
          </Typography>
        </Toolbar>
      </AppBar>
      <div />
    </>
  )
}

export default NewPlayList
