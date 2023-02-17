import {
  Box,
  Button,
  TextField,
  FormControl,
  Typography,
  useTheme,
  FormHelperText,
} from '@mui/material'
import { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Router from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { AxiosResponse } from 'axios'
import { useCallback } from 'react'
import api from '@/services/api'

interface RegisterFormModel {
  email: string
  username: string
  password: string
}

const schema = yup.object().shape({
  email: yup.string().email('email inválido').required('obrigatório'),
  username: yup.string().required('obrigatório').min(2),
  password: yup
    .string()
    .required('obrigatório')
    .min(4, 'pelo menos 4 caracteres'),
})

const Register: NextPage = (): JSX.Element => {
  const theme = useTheme()
  const { control, handleSubmit } = useForm<RegisterFormModel>({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    async (values: RegisterFormModel): Promise<void> => {
      try {
        const res: AxiosResponse = await api.post('/auth/register', values)
        window.localStorage.setItem('token', res.data.accessToken)
        Router.replace('/')
      } catch (err) {
        alert('error')
      }
    },
    []
  )

  return (
    <>
      <Head>
        <title>JunkBox - Register Page</title>
        <meta name="description" content="JunkBox Register Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        sx={{
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '25rem',
          marginInline: 'auto',
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Image src="/icon.png" width={130} height={130} />
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography fontSize={36} fontWeight={500}>
            Nova Conta
          </Typography>
        </Box>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}>
            <Controller
              control={control}
              name="email"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <FormControl variant="standard" error={!!error?.message}>
                  <TextField
                    id="standard-basic"
                    name="email"
                    label="Email"
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
              name="username"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <FormControl variant="standard" error={!!error?.message}>
                  <TextField
                    id="standard-basic"
                    name="username"
                    label="Nome de usuário"
                    variant="standard"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={onBlur}
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
                    type="password"
                    label="Senha"
                    variant="standard"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={onBlur}
                    sx={{ width: '100%' }}
                  />
                  <FormHelperText id="component-error-text">
                    {error?.message}
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 4, width: '100%' }}
          >
            CRIAR
          </Button>
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              justifyContent: 'center',
            }}
            onClick={() => Router.replace('/login')}
          >
            <Typography>
              Já tenho conta!{' '}
              <Box component="span" sx={{ color: theme.palette.info.main }}>
                Entrar
              </Box>
            </Typography>
          </Box>
        </form>
      </Box>
    </>
  )
}

export default Register
