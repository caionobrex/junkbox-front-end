import 'styles/globals.css'
import 'normalize.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { createTheme, ThemeProvider } from '@mui/material'
import Player, { usePlayerStore } from '@/components/Player'
import useUser from '@/hooks/dataHooks/useUser'

const theme = createTheme({
  palette: {
    primary: {
      main: '#794B2F',
    },
  },
})

function MyApp({ Component, pageProps, router }: AppProps) {
  const { currentTrack } = usePlayerStore()
  const [user, loading, error] = useUser()

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Component {...pageProps} key={router.route} />
      {!loading && user && !error && currentTrack && <Player />}
    </ThemeProvider>
  )
}

export default MyApp
