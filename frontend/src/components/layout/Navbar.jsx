import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import { getNotifications } from '../../api/notification'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      getNotifications()
        .then((res) => setUnreadCount(res.data.filter((n) => !n.isRead).length))
        .catch(() => {})
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          HobbyHeavy
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/meetup/create" className="text-sm text-gray-600 hover:text-indigo-600">
                모임 만들기
              </Link>
              <Link to="/schedules" className="text-sm text-gray-600 hover:text-indigo-600">
                내 일정
              </Link>
              <Link
                to="/notifications"
                className="relative text-sm text-gray-600 hover:text-indigo-600"
              >
                알림
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/my" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                {user.userId}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600">
                로그인
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}