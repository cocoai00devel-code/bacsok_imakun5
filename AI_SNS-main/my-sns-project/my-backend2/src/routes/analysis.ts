import { Hono } from 'hono'
import { isFingerRaised } from '../services/hand-logic'

const analysis = new Hono()

analysis.post('/check', async (c) => {
  const { landmarks } = await c.req.json()
  // ここで services のロジックを呼び出す
  const result = isFingerRaised(landmarks[8], landmarks[5]) 
  return c.json({ raised: result })
})

export default analysis