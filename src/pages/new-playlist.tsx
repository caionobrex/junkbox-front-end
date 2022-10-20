import {
  AppBar,
  Box,
  Button,
  Switch,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
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

      <Box
        sx={{
          px: 2,
          pt: 3,
          display: 'flex',
          flexDirection: 'column',
          rowGap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={400}
            component="div"
            sx={{ flexGrow: 1, mb: 1 }}
          >
            Qual o nome da playlist?
          </Typography>
          <TextField
            id="outlined-basic"
            label="Nome da playlist"
            variant="outlined"
            sx={{ width: '100%' }}
          />
        </Box>
        <Box>
          <Typography
            variant="h6"
            fontWeight={400}
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Essa playlist e privada ?
          </Typography>
          <Switch />
        </Box>
        <Box>
          <Typography
            variant="h6"
            fontWeight={400}
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Limitar musicas por usuario ?
          </Typography>
          <Switch />
        </Box>
        <Box>
          <Typography
            variant="h6"
            fontWeight={400}
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Apenas acesso local
          </Typography>
          <Switch />
        </Box>
        <Box>
          <Typography
            variant="h6"
            fontWeight={400}
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Habilitar blacklist
          </Typography>
          <Switch />
        </Box>

        <Button variant="contained" sx={{ mt: 2 }}>
          CRIAR PLAYLIST
        </Button>
      </Box>
    </>
  )
}

export default NewPlayList
