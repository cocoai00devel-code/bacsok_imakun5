// src/index.ts に追記・修正
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import sign from './routes/sign'
import analysis from './routes/analysis'

const app = new Hono()

app.use('*', cors())

// 各ルートを登録
app.route('/api/signs', sign)     // これで /api/signs... というURLが有効になります
app.route('/api/analysis', analysis)

app.get('/', (c) => c.text('Sign Language API Home'))

export default app