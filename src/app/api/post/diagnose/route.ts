import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { claudeComplete } from '@/lib/anthropic'
import { getDb } from '@/lib/db'
import { generateId } from '@/lib/utils'
import type { PlanType } from '@/lib/plans'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { postUrl, keyword } = await req.json()
  if (!postUrl?.trim()) return NextResponse.json({ error: '게시글 URL을 입력해주세요.' }, { status: 400 })

  const { allowed } = await checkUsageLimit(session.id, 'post_diagnosis_count', session.plan as PlanType)
  if (!allowed) return NextResponse.json({ error: '일일 게시글 진단 한도를 초과했습니다.' }, { status: 429 })

  try {
    const keywordPart = keyword?.trim() ? `타겟 키워드: "${keyword.trim()}"` : '타겟 키워드 없음'

    const prompt = `다음 블로그 게시글을 SEO 관점에서 진단해주세요.
게시글 URL: ${postUrl.trim()}
${keywordPart}

URL 구조와 패턴을 분석하여 게시글의 SEO 최적화 상태를 진단해주세요.

아래 JSON 형식으로만 응답하세요:
{
  "title": "게시글 제목 추정",
  "seoScore": 65,
  "readabilityScore": 70,
  "rankingPotential": 60,
  "overallScore": 65,
  "summary": "게시글 전반적인 평가 요약 (2-3문장)",
  "seoAnalysis": {
    "titleOptimization": {"score": 70, "feedback": "제목 최적화 관련 피드백"},
    "keywordUsage": {"score": 60, "feedback": "키워드 사용 관련 피드백"},
    "structure": {"score": 75, "feedback": "글 구조 관련 피드백"},
    "metaDescription": {"score": 50, "feedback": "메타 설명 관련 피드백"},
    "imageOptimization": {"score": 65, "feedback": "이미지 최적화 관련 피드백"}
  },
  "recommendations": [
    {"title": "개선 제목", "description": "구체적인 개선 방법", "impact": "high"},
    {"title": "개선 제목", "description": "구체적인 개선 방법", "impact": "medium"}
  ],
  "competitorTips": ["경쟁력 향상 팁1", "경쟁력 향상 팁2", "경쟁력 향상 팁3"]
}

점수는 0~100 사이.
impact는 "high", "medium", "low" 중 하나.
recommendations는 5~7개.
한국 블로그(네이버/티스토리) SEO 특성을 반영해주세요.`

    const raw = await claudeComplete(prompt, {
      system: '한국 블로그 게시글 SEO 전문 분석가입니다. JSON만 응답하세요.',
      temperature: 0.7,
      maxTokens: 3000,
    })

    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ error: '분석에 실패했습니다. 다시 시도해주세요.' }, { status: 500 })

    const result = JSON.parse(match[0])
    await incrementUsage(session.id, 'post_diagnosis_count')

    const db = await getDb()
    const id = generateId()
    await db.run(
      'INSERT INTO post_diagnostics (id, user_id, post_url, keyword, seo_score, readability_score, ranking_potential, recommendations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, session.id, postUrl.trim(), keyword?.trim() || null, result.seoScore, result.readabilityScore, result.rankingPotential, JSON.stringify(result)]
    )

    return NextResponse.json({ id, ...result })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '게시글 진단에 실패했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
