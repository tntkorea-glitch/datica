import { getDb } from './db'
import { getPlanLimit, type PlanType } from './plans'
import { todayString } from './utils'

type UsageType = 'keyword_count' | 'ai_credit_count' | 'blog_diagnosis_count'

export async function checkUsageLimit(userId: string, type: UsageType, plan: PlanType): Promise<{ allowed: boolean; current: number; limit: number }> {
  const db = await getDb()
  const today = todayString()
  const row = await db.get<Record<string, number>>('SELECT * FROM usage_limits WHERE user_id = ? AND date = ?', [userId, today])

  const current = row ? (row[type] as number || 0) : 0

  const limits = getPlanLimit(plan)
  let limit: number
  switch (type) {
    case 'keyword_count': limit = limits.keywordsPerMin * 60 * 24; break // daily approximation
    case 'ai_credit_count': limit = limits.aiCreditsPerDay; break
    case 'blog_diagnosis_count': limit = limits.blogDiagnosisPerDay; break
    default: limit = 999999
  }

  return { allowed: current < limit, current, limit }
}

export async function incrementUsage(userId: string, type: UsageType): Promise<void> {
  const db = await getDb()
  const today = todayString()

  await db.run(
    `INSERT INTO usage_limits (user_id, date, ${type}) VALUES (?, ?, 1)
     ON CONFLICT(user_id, date) DO UPDATE SET ${type} = ${type} + 1`,
    [userId, today]
  )
}

export async function getUsageStats(userId: string): Promise<{ keyword_count: number; ai_credit_count: number; blog_diagnosis_count: number }> {
  const db = await getDb()
  const today = todayString()
  const row = await db.get<{ keyword_count: number; ai_credit_count: number; blog_diagnosis_count: number }>(
    'SELECT keyword_count, ai_credit_count, blog_diagnosis_count FROM usage_limits WHERE user_id = ? AND date = ?',
    [userId, today]
  )
  return row || { keyword_count: 0, ai_credit_count: 0, blog_diagnosis_count: 0 }
}
