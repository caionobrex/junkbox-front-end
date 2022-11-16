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
import { useCallback, useEffect } from 'react'
import { NextRouter, useRouter } from 'next/router'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { AxiosResponse } from 'axios'
import useUser from '@/hooks/dataHooks/useUser'
import api from '@/services/api'

interface FormSchema {
  name: string
  isPrivate: boolean
  password: string
  limitSongs: boolean
  maxSongs: number
}

const schema = yup.object().shape({
  name: yup.string().required(),
  isPrivate: yup.boolean().default(false),
  password: yup.string(),
  limitSongs: yup.boolean().default(false),
  maxSongs: yup.string(),
})

const NewPlayList: NextPage = (): JSX.Element => {
  const [user, loading] = useUser()
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<FormSchema>({
    resolver: yupResolver(schema),
  })
  const router: NextRouter = useRouter()
  const watchIsPrivate = watch('isPrivate')
  const watchLimitSongs = watch('limitSongs')

  const onSubmitHandler = useCallback((values: FormSchema): Promise<void> => {
    return api
      .post('/playlists', {
        name: values.name,
        maxLength: values.limitSongs ? values.maxSongs : null,
        isPrivate: values.isPrivate,
        password: values.password,
        description: 'Testing',
      })
      .then((res: AxiosResponse) => {
        router.push(`/${res.data.id}`)
      })
  }, [])

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading])

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
        component="form"
        onSubmit={handleSubmit(onSubmitHandler)}
        sx={{
          px: 2,
          pt: 4,
          display: 'flex',
          flexDirection: 'column',
          rowGap: 3,
          maxWidth: '28rem',
          mx: 'auto',
        }}
      >
        <Box>
          <TextField
            id="outlined-basic"
            label="Nome da playlist"
            variant="outlined"
            sx={{ width: '100%' }}
            {...register('name')}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Typography
            variant="h6"
            fontWeight={400}
            component="div"
            sx={{ flexGrow: 1, pb: 1, fontSize: '1rem' }}
          >
            Essa playlist é privada ?
          </Typography>
          <Switch {...register('isPrivate')} />
        </Box>
        {watchIsPrivate && (
          <Box>
            <TextField
              id="outlined-basic"
              label="Defina uma senha para essa playlist"
              variant="outlined"
              sx={{ width: '100%' }}
              {...register('password')}
            />
          </Box>
        )}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Typography
            variant="h6"
            fontWeight={400}
            component="div"
            sx={{ flexGrow: 1, pb: 1, fontSize: '1rem' }}
          >
            Limitar tamanho da playlist ?
          </Typography>
          <Switch {...register('limitSongs')} />
        </Box>
        {watchLimitSongs && (
          <Box>
            <TextField
              id="outlined-basic"
              label="Defina um limite"
              variant="outlined"
              sx={{ width: '100%' }}
              {...register('maxSongs')}
            />
          </Box>
        )}
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'CRIANDO...' : 'CRIAR PLAYLIST'}
        </Button>
      </Box>
    </>
  )
}

export default NewPlayList
