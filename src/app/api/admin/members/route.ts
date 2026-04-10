import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getAllUsers, updateUserPlan, deleteUser } from '@/lib/users'
import type { PlanType } from '@/lib/plans'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const users = await getAllUsers()
  return NextResponse.json({
    users: users.map(u => ({
      id: u.id, email: u.email, name: u.name, role: u.role,
      plan: u.plan, planExpiry: u.plan_expiry, referralCode: u.referral_code,
      provider: u.provider, createdAt: u.created_at,
    })),
  })
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const { userId, plan, expiryDays } = await req.json()
  const ok = await updateUserPlan(userId, plan as PlanType, expiryDays)
  return NextResponse.json({ ok })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const { userId } = await req.json()
  const ok = await deleteUser(userId)
  return NextResponse.json({ ok })
}
