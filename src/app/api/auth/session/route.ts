import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { findUserById } from '@/lib/users'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null })

  const user = await findUserById(session.id)
  if (!user) return NextResponse.json({ user: null })

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
      planExpiry: user.plan_expiry,
      referralCode: user.referral_code,
      createdAt: user.created_at,
    },
  })
}
