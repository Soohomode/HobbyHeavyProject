import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateMyInfo, updatePassword, deleteUser } from '../api/auth'
import { getMyMeetups } from '../api/meetup'
import MeetupCard from '../components/meetup/MeetupCard'

const TABS = [
  { key: 'info', label: '내 정보' },
  { key: 'meetups', label: '내 모임' },
  { key: 'password', label: '비밀번호 변경' },
  { key: 'delete', label: '회원 탈퇴' },
]

export default function MyPage() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('info')
  const [myMeetups, setMyMeetups] = useState([])
  const [infoForm, setInfoForm] = useState({ username: '', email: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [deletePassword, setDeletePassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) setInfoForm({ username: user.username || '', email: user.email || '' })
  }, [user])

  useEffect(() => {
    if (tab === 'meetups') {
      getMyMeetups()
        .then((res) => setMyMeetups(res.data))
        .catch(() => {})
    }
  }, [tab])

  const reset = () => { setMessage(''); setError('') }

  const handleUpdateInfo = async (e) => {
    e.preventDefault()
    reset()
    try {
      await updateMyInfo(infoForm)
      await refreshUser()
      setMessage('정보가 업데이트되었습니다.')
    } catch {
      setError('업데이트에 실패했습니다.')
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    reset()
    try {
      await updatePassword(pwForm)
      setPwForm({ currentPassword: '', newPassword: '' })
      setMessage('비밀번호가 변경되었습니다.')
    } catch {
      setError('비밀번호 변경에 실패했습니다.')
    }
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    if (!confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    try {
      await deleteUser({ password: deletePassword })
      await logout()
      navigate('/')
    } catch {
      setError('회원 탈퇴에 실패했습니다.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">마이페이지</h1>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); reset() }}
            className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">{message}</div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      {tab === 'info' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="mb-5 text-sm text-gray-500">
            아이디:{' '}
            <span className="text-gray-800 font-medium">{user?.userId}</span>
            <span className="mx-2">&middot;</span>
            나이: <span className="text-gray-800 font-medium">{user?.age}세</span>
          </div>
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={infoForm.username}
                onChange={(e) => setInfoForm({ ...infoForm, username: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={infoForm.email}
                onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              저장
            </button>
          </form>
        </div>
      )}

      {tab === 'meetups' && (
        <div>
          {myMeetups.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">&#127919;</p>
              <p>참가 중인 모임이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {myMeetups.map((m) => (
                <MeetupCard key={m.meetupId} meetup={m} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'password' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
              <input
                type="password"
                placeholder="8자 이상"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              변경
            </button>
          </form>
        </div>
      )}

      {tab === 'delete' && (
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <p className="text-sm text-red-500 mb-5">
            &#9888;&#65039; 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
          </p>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
            >
              회원 탈퇴
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
