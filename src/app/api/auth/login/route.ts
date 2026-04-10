import { NextRequest, NextResponse } from 'next/server'
import { verifyUser } from '@/lib/users'
import { createToken, getTokenCookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 })
    }

    const user = await verifyUser(email, password)
    if (!user) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
    }

    const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan }
    const token = await createToken(sessionUser)
    const res = NextResponse.json({
      user: { ...sessionUser, referralCode: user.referral_code, planExpiry: user.plan_expiry, createdAt: user.created_at },
    })
    res.cookies.set(getTokenCookieOptions(token))
    return res
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
