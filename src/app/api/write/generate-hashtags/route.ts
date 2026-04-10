import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { claudeComplete } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { keyword, title, content } = await req.json()
  if (!keyword) return NextResponse.json({ error: '키워드가 필요합니다.' }, { status: 400 })

  try {
    const prompt = `아래 블로그 글에 대한 해시태그를 생성해주세요.

키워드: ${keyword}
제목: ${title || ''}
본문 일부: ${(content || '').slice(0, 500)}

아래 JSON 형식으로만 응답하세요:
{
  "blog": ["태그1", "태그2", "태그3", "태그4", "태그5", "태그6", "태그7", "태그8", "태그9", "태그10"],
  "instagram": ["#태그1", "#태그2", "#태그3", "#태그4", "#태그5", "#태그6", "#태그7", "#태그8", "#태그9", "#태그10", "#태그11", "#태그12", "#태그13", "#태그14", "#태그15"]
}

blog는 네이버 블로그용 태그 10~15개 (#없이), instagram은 인스타그램용 해시태그 15~20개 (#포함).`

    const raw = await claudeComplete(prompt, {
      system: '해시태그 생성 전문가입니다. JSON만 응답하세요.',
      temperature: 0.7,
      maxTokens: 800,
    })

    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      const data = JSON.parse(match[0])
      return NextResponse.json(data)
    }

    return NextResponse.json({ blog: [], instagram: [] })
  } catch {
    return NextResponse.json({ error: '해시태그 생성에 실패했습니다.' }, { status: 500 })
  }
}
