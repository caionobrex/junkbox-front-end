import {
  Box,
  Button,
  TextField,
  FormControl,
  Typography,
  FormHelperText,
} from '@mui/material'
import { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Router from 'next/router'
import { useTheme } from '@mui/material/styles'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

interface LoginFormModel {
  username: string
  password: string
}

const schema = yup.object().shape({
  username: yup.string().required('obrigatório').min(2),
  password: yup
    .string()
    .required('obrigatório')
    .min(4, 'pelo menos 4 caracteres'),
})

const Login: NextPage = (): JSX.Element => {
  const theme = useTheme()
  const { control, handleSubmit } = useForm<LoginFormModel>({
    resolver: yupResolver(schema),
  })

  return (
    <>
      <Head>
        <title>JunkBox - LoginPage</title>
        <meta name="description" content="JunkBox LoginPage" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        sx={{
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
          <Image src="/icon.png" width={130} height={130} />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography fontSize={36} fontWeight={500}>
            Login
          </Typography>
        </Box>
        <form onSubmit={handleSubmit(() => {})}>
          <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}>
            <Controller
              control={control}
              name="username"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <FormControl variant="standard" error={!!error?.message}>
                  <TextField
                    id="standard-basic"
                    name="username"
                    label="Email ou Nome de usuario"
                    variant="standard"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      onChange(event.target.value)
                    }
                    onBlur={onBlur}
                    value={value}
                    sx={{ width: '100%' }}
                  />
                  <FormHelperText id="component-error-text">
                    {error?.message}
                  </FormHelperText>
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <FormControl variant="standard" error={!!error?.message}>
                  <TextField
                    id="standard-basic"
                    name="password"
                    label="Senha"
                    type="password"
                    variant="standard"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      onChange(event.target.value)
                    }
                    onBlur={onBlur}
                    value={value}
                    sx={{ width: '100%' }}
                  />
                  <FormHelperText id="component-error-text">
                    {error?.message}
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Typography sx={{ color: theme.palette.info.main }}>
              Esqueceu senha ?
            </Typography>
          </Box>
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 4, width: '100%' }}
          >
            ENTRAR
          </Button>
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              justifyContent: 'center',
            }}
            onClick={() => Router.replace('/register')}
          >
            <Typography>
              Não tem conta?{' '}
              <Box component="span" sx={{ color: theme.palette.info.main }}>
                Criar
              </Box>
            </Typography>
          </Box>
        </form>
      </Box>
    </>
  )
}

export default Login
