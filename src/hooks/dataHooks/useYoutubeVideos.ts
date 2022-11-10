import useSWR from 'swr'
import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_GOOGLE_BASEURL
const key = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

export default function useYoutubeVideos() {
  const { data, error } = useSWR(
    `/youtube/v3/videos?part=snippet&chart=mostPopular&&videoCategoryId=10&key=${key}`,
    (url) => axios.get(`${baseURL}/${url}`).then((res) => res.data)
  )
  const loading = !error && !data
  return [data, loading, error]
}
