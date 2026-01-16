import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// 1. 手話マスターテーブル
export const signs = sqliteTable('signs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),          // 例: "ありがとう"
  category: text('category'),            // 例: "挨拶"
  videoUrl: text('video_url'),           // お手本動画のURL
  description: text('description'),      // 動きのコツなどの説明
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// 2. 認識用ランドマークデータ（AI判定の基準値）
// 1つの手話に対して、複数の「正解パターン」を紐付けられるようにします
export const landmarks = sqliteTable('landmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  signId: integer('sign_id').references(() => signs.id), // どの手話のデータか
  pointIndex: integer('point_index').notNull(),          // 手の関節番号(0~20)
  expectedX: real('expected_x').notNull(),               // 理想的なX座標
  expectedY: real('expected_y').notNull(),               // 理想的なY座標
  tolerance: real('tolerance').default(0.1),             // 許容誤差
});

// 3. ユーザー学習進捗テーブル
export const userProgress = sqliteTable('user_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),                     // ユーザー識別子
  signId: integer('sign_id').references(() => signs.id),
  status: text('status').default('learning'),            // learning / mastered
  lastPracticedAt: integer('last_practiced_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});