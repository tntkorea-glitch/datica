'use client'

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import Header from '@/components/Header'

interface Member {
  id: string; email: string; name: string; role: string
  plan: string; planExpiry: string | null; createdAt: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    fetch('/api/admin/members').then(r => r.json()).then(d => setMembers(d.users || []))
  }, [])

  const changePlan = async (userId: string, plan: string) => {
    await fetch('/api/admin/members', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan, expiryDays: 30 }),
    })
    setMembers(prev => prev.map(m => m.id === userId ? { ...m, plan } : m))
  }

  const deleteMember = async (userId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await fetch('/api/admin/members', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setMembers(prev => prev.filter(m => m.id !== userId))
  }

  return (
    <>
      <Header title="회원 관리" />
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">이름</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">이메일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">플랜</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">가입일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">액션</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={m.plan}
                      onChange={e => changePlan(m.id, e.target.value)}
                      className="text-xs border border-border rounded px-2 py-1"
                    >
                      {['free', 'basic', 'premium', 'premiumplus'].map(p => (
                        <option key={p} value={p}>{p === 'premiumplus' ? 'Premium+' : p}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(m.createdAt).toLocaleDateString('ko-KR')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteMember(m.id)} className="text-danger hover:text-danger/70">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
