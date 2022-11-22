import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import cache from 'memory-cache'

const baseURL = process.env.GOOGLE_BASEURL
const key = process.env.GOOGLE_API_KEY

export default async function tracks(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let endpoint = `/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=10&key=${key}`
  if (req.query.searchValue)
    endpoint = `/youtube/v3/search?part=snippet&maxResults=10&q=${req.query.searchValue}&key=${key}`
  const cachedTracks = cache.get('tracks')
  if (cachedTracks && !req.query.searchValue) return res.json(cachedTracks)
  try {
    const { data } = await axios.get(`${baseURL}/${endpoint}`)
    cache.put('tracks', data)
    return res.json(data)
  } catch (err) {
    res.statusCode = 400
    return res.json({ error: 'Api erro' })
  }
}
