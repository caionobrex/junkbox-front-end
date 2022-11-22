import useSWR from 'swr'
import axios from 'axios'

export default function useYoutubeVideos(searchValue = '') {
  const { data, error } = useSWR(
    `/api/tracks?searchValue=${searchValue}`,
    (url) => axios.get(url).then((res) => res.data)
  )
  const loading = !error && !data
  return [data, loading, error]
}
