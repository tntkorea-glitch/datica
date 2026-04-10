export type PlanType = 'free' | 'basic' | 'premium' | 'premiumplus'

export interface PlanLimit {
  keywordsPerMin: number
  aiCreditsPerDay: number
  blogDiagnosisPerDay: number
  postDiagnosisPerDay: number
  influencerSearchPerDay: number
  blogRankPosts: number
  blogRankKeywords: number
  concurrent: number
  adFree: boolean
  price: number
  annualPrice: number
  name: string
  nameKo: string
  description: string
}

export const PLAN_LIMITS: Record<PlanType, PlanLimit> = {
  free: {
    keywordsPerMin: 3,
    aiCreditsPerDay: 1,
    blogDiagnosisPerDay: 1,
    postDiagnosisPerDay: 1,
    influencerSearchPerDay: 3,
    blogRankPosts: 1,
    blogRankKeywords: 3,
    concurrent: 1,
    adFree: false,
    price: 0,
    annualPrice: 0,
    name: 'Free',
    nameKo: '무료',
    description: '기본 기능을 무료로 체험',
  },
  basic: {
    keywordsPerMin: 10,
    aiCreditsPerDay: 30,
    blogDiagnosisPerDay: 10,
    postDiagnosisPerDay: 10,
    influencerSearchPerDay: 10,
    blogRankPosts: 10,
    blogRankKeywords: 20,
    concurrent: 1,
    adFree: true,
    price: 19800,
    annualPrice: 198000,
    name: 'Basic',
    nameKo: '베이직',
    description: '처음 시작하는 크리에이터를 위한 플랜',
  },
  premium: {
    keywordsPerMin: 30,
    aiCreditsPerDay: 60,
    blogDiagnosisPerDay: 50,
    postDiagnosisPerDay: 50,
    influencerSearchPerDay: 20,
    blogRankPosts: 50,
    blogRankKeywords: 100,
    concurrent: 2,
    adFree: true,
    price: 39600,
    annualPrice: 396000,
    name: 'Premium',
    nameKo: '프리미엄',
    description: '수익화를 본격화하는 크리에이터의 선택',
  },
  premiumplus: {
    keywordsPerMin: 50,
    aiCreditsPerDay: 100,
    blogDiagnosisPerDay: 200,
    postDiagnosisPerDay: 200,
    influencerSearchPerDay: 50,
    blogRankPosts: 200,
    blogRankKeywords: 600,
    concurrent: 3,
    adFree: true,
    price: 99000,
    annualPrice: 990000,
    name: 'Premium+',
    nameKo: '프리미엄+',
    description: '트래픽 성장을 극대화하는 전문 플랜',
  },
}

export function getPlanLimit(plan: PlanType): PlanLimit {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}
