import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const db = await getDb()
  const keywords = await db.all(
    'SELECT * FROM trending_keywords ORDER BY captured_at DESC, rank ASC LIMIT 100'
  )

  return NextResponse.json({ keywords })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const { id } = await req.json()
  const db = await getDb()
  await db.run('DELETE FROM trending_keywords WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
