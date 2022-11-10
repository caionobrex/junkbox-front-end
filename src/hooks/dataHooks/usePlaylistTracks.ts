import useSWR from 'swr'
import api from '@/services/api'

export default function usePlaylistTracks(id: string) {
  const { data, error } = useSWR(`/playlists/${id}/tracks`, (url) =>
    api.get(url).then((res) => res.data)
  )
  const loading = !error && !data
  return [data, loading, error]
}
