import { useState } from 'react'
import { voteSchedule, unvoteSchedule, confirmSchedule, cancelSchedule } from '../../api/schedule'

const STATUS_MAP = {
  PROPOSED: { label: '제안됨', cls: 'text-blue-600 bg-blue-50' },
  CONFIRMED: { label: '확정', cls: 'text-green-600 bg-green-50' },
  CANCELLED: { label: '취소됨', cls: 'text-red-600 bg-red-50' },
}

export default function ScheduleCard({ schedule, isHost, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const status = STATUS_MAP[schedule.status] || STATUS_MAP.PROPOSED

  const run = async (fn) => {
    setLoading(true)
    try {
      await fn()
      onUpdate()
    } catch (e) {
      alert(e.response?.data?.message || '처리 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    await run(() => cancelSchedule(schedule.scheduleId, cancelReason))
    setShowCancel(false)
  }

  const fmt = (dt) =>
    dt ? new Date(dt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' }) : '-'

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.cls}`}>
            {status.label}
          </span>
          <p className="font-medium text-gray-800">{fmt(schedule.proposalDate)}</p>
          {schedule.location && (
            <p className="text-sm text-gray-500">&#128205; {schedule.location}</p>
          )}
          {schedule.activateTime && (
            <p className="text-sm text-gray-500">&#9201; {schedule.activateTime}</p>
          )}
        </div>
        <div className="text-right text-sm">
          <p className="text-gray-600 font-medium">&#128587; {schedule.voteCount}명</p>
          {schedule.votingDeadline && (
            <p className="text-xs text-gray-400 mt-0.5">마감 {fmt(schedule.votingDeadline)}</p>
          )}
        </div>
      </div>

      {schedule.status === 'PROPOSED' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => run(() => voteSchedule(schedule.scheduleId))}
            disabled={loading}
            className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            투표
          </button>
          <button
            onClick={() => run(() => unvoteSchedule(schedule.scheduleId))}
            disabled={loading}
            className="text-sm px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            투표 취소
          </button>
          {isHost && (
            <>
              <button
                onClick={() => run(() => confirmSchedule(schedule.scheduleId))}
                disabled={loading}
                className="text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                확정
              </button>
              <button
                onClick={() => setShowCancel(!showCancel)}
                className="text-sm px-3 py-1.5 border border-red-300 text-red-500 rounded-lg hover:bg-red-50"
              >
                취소 처리
              </button>
            </>
          )}
        </div>
      )}

      {showCancel && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="취소 사유"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-400"
          />
          <button
            onClick={handleCancel}
            disabled={loading}
            className="text-sm px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            확인
          </button>
        </div>
      )}

      {schedule.cancellationReason && (
        <p className="mt-2 text-sm text-red-500">취소 사유: {schedule.cancellationReason}</p>
      )}
    </div>
  )
}
