import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const db = await getDb()
  const rows = await db.all(
    'SELECT id, blog_url, overall_score, seo_score, content_score, activity_score, analyzed_at FROM blog_diagnostics WHERE user_id = ? ORDER BY analyzed_at DESC LIMIT 50',
    [session.id]
  )

  return NextResponse.json({ history: rows })
}
