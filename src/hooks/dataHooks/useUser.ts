import useSWR from 'swr'
import api from '@/services/api'

export default function useUser() {
  const { data, error } = useSWR(
    '/users/me',
    (url) => api.get(url).then((res) => res.data),
    { revalidateOnMount: true, revalidateOnFocus: true }
  )

  const loading = !error && !data
  return [data, loading, error]
}
