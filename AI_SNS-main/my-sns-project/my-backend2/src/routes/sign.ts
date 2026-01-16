import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { signs } from '../db/schema'

// Hono の環境変数（D1データベースなど）の型定義
type Bindings = {
  DB: D1Database
}

const sign = new Hono<{ Bindings: Bindings }>()

// 1. 手話の一覧を取得する (GET /api/signs)
sign.get('/', async (c) => {
  const db = drizzle(c.env.DB)
  
  try {
    const allSigns = await db.select().from(signs).all()
    return c.json(allSigns)
  } catch (e) {
    return c.json({ error: 'データ取得に失敗しました' }, 500)
  }
})

// 2. 特定の手話の詳細を取得する (GET /api/signs/:id)
sign.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const db = drizzle(c.env.DB)

  const result = await db.select().from(signs).where(eq(signs.id, id)).get()

  if (!result) {
    return c.json({ error: '指定された手話は見つかりません' }, 404)
  }

  return c.json(result)
})

// 3. 新しい手話を登録する (POST /api/signs)
// ※管理画面などから利用するイメージです
sign.post('/', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()

  try {
    const newSign = await db.insert(signs).values({
      name: body.name,
      category: body.category,
      videoUrl: body.videoUrl,
      description: body.description,
    }).returning()

    return c.json({ message: '登録完了', data: newSign }, 201)
  } catch (e) {
    return c.json({ error: '登録に失敗しました' }, 400)
  }
})

export default sign