import useSWR from 'swr'
import api from '@/services/api'

export default function usePlaylists() {
  const { data, error } = useSWR(
    '/playlists',
    (url) => api.get(url).then((res) => res.data),
    { revalidateOnMount: true, revalidateOnFocus: true }
  )

  const loading = !error && !data
  return [data, loading, error]
}
