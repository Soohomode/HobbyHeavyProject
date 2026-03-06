import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllSchedules } from '../api/schedule'
import ScheduleCard from '../components/schedule/ScheduleCard'

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    try {
      const res = await getAllSchedules()
      setSchedules(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  if (loading)
    return <div className="text-center py-20 text-gray-400 animate-pulse">불러오는 중...</div>

  const now = new Date()
  const upcoming = schedules.filter(
    (s) => s.status !== 'CANCELLED' && new Date(s.proposalDate) >= now,
  )
  const past = schedules.filter(
    (s) => s.status === 'CONFIRMED' && new Date(s.proposalDate) < now,
  )

  if (schedules.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">&#128197;</p>
        <p className="mb-4">참가 중인 모임의 일정이 없습니다.</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm">
          모임 찾기
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">내 일정</h1>

      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-600 mb-3">
            예정 일정 ({upcoming.length})
          </h2>
          <div className="space-y-3">
            {upcoming.map((s) => (
              <ScheduleCard key={s.scheduleId} schedule={s} isHost={false} onUpdate={fetch} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-600 mb-3">
            지난 일정 ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map((s) => (
              <ScheduleCard key={s.scheduleId} schedule={s} isHost={false} onUpdate={fetch} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
