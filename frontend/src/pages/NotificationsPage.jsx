import { useEffect, useState } from 'react'
import { getNotifications, markAsRead } from '../api/notification'

const TYPE_ICON = {
  SCHEDULE_PROPOSED: '&#128197;',
  SCHEDULE_CONFIRMED: '&#9989;',
  SCHEDULE_CANCELLED: '&#10060;',
  PARTICIPANT_APPROVED: '&#127881;',
  PARTICIPANT_REJECTED: '&#128546;',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    try {
      const res = await getNotifications()
      setNotifications(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)),
      )
    } catch {}
  }

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead)
    await Promise.all(unread.map((n) => markAsRead(n.notificationId)))
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  if (loading)
    return <div className="text-center py-20 text-gray-400 animate-pulse">불러오는 중...</div>

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          알림{' '}
          {unreadCount > 0 && (
            <span className="text-lg text-indigo-600">({unreadCount})</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-indigo-600 hover:underline"
          >
            전체 읽음
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">&#128276;</p>
          <p>알림이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.notificationId}
              className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                n.isRead ? 'bg-white border-gray-100' : 'bg-indigo-50 border-indigo-100'
              }`}
            >
              <span className="text-2xl shrink-0">
                {TYPE_ICON[n.type] || '&#128276;'}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    n.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'
                  }`}
                >
                  {n.message}
                </p>
                {n.createdDate && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(n.createdDate).toLocaleString('ko-KR')}
                  </p>
                )}
              </div>
              {!n.isRead && (
                <button
                  onClick={() => handleMarkAsRead(n.notificationId)}
                  className="text-xs text-indigo-500 hover:underline shrink-0 self-start"
                >
                  읽음
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
