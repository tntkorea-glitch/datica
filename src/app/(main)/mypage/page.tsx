'use client'

import { useState, useEffect } from 'react'
import { User, Crown, Link2, History, Copy, Check } from 'lucide-react'
import Header from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'

type Tab = 'profile' | 'membership' | 'referral' | 'history'

export default function MyPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('profile')
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<{ id: string; keyword: string; title: string; created_at: string }[]>([])

  useEffect(() => {
    if (tab === 'history') {
      fetch('/api/write/history').then(r => r.json()).then(d => setHistory(d.history || []))
    }
  }, [tab])

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: '프로필', icon: User },
    { key: 'membership', label: '멤버십', icon: Crown },
    { key: 'referral', label: '추천인', icon: Link2 },
    { key: 'history', label: '이용 내역', icon: History },
  ]

  const copyReferral = () => {
    if (!user?.referralCode) return
    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user.referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!user) return null

  return (
    <>
      <Header title="마이페이지" />
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="flex gap-1 mb-6 border-b border-border">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === key ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          {tab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400">이름</label>
                <p className="text-sm font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">이메일</label>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">가입일</label>
                <p className="text-sm font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}</p>
              </div>
            </div>
          )}

          {tab === 'membership' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-accent" />
                <div>
                  <p className="font-bold text-lg">{user.plan === 'premiumplus' ? 'Premium+' : user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} 플랜</p>
                  {user.planExpiry && <p className="text-xs text-gray-400">만료일: {new Date(user.planExpiry).toLocaleDateString('ko-KR')}</p>}
                </div>
              </div>
              <a href="/membership" className="inline-block bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition">
                플랜 변경하기
              </a>
            </div>
          )}

          {tab === 'referral' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400">나의 추천 코드</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono">{user.referralCode}</code>
                  <button onClick={copyReferral} className="flex items-center gap-1 px-3 py-2 text-xs bg-accent/10 text-accent rounded-lg hover:bg-accent/20">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? '복사됨' : '링크 복사'}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500">친구에게 추천 링크를 공유하세요!</p>
            </div>
          )}

          {tab === 'history' && (
            <div>
              {history.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">아직 생성한 콘텐츠가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {history.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.keyword} | {new Date(item.created_at).toLocaleDateString('ko-KR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
