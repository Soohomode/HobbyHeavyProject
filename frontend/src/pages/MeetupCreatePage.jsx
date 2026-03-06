import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMeetup } from '../api/meetup'
import { getHobbies } from '../api/hobby'

export default function MeetupCreatePage() {
  const [form, setForm] = useState({
    meetupName: '',
    description: '',
    location: '',
    recurrenceRule: '',
    maxParticipants: 10,
    hobbyName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdId, setCreatedId] = useState(null)
  const [hobbies, setHobbies] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getHobbies().then((res) => setHobbies(res.data)).catch(() => {})
  }, [])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await createMeetup({ ...form, maxParticipants: Number(form.maxParticipants) })
      setCreatedId(res.data)
    } catch (e) {
      setError(e.response?.data || '모임 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (createdId) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">모임이 만들어졌어요!</h2>
          <p className="text-gray-500 text-sm mb-8">모임이 성공적으로 생성되었습니다.<br />멤버들을 기다리고 있어요.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/meetup/${createdId}`)}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700"
            >
              내 모임 보러 가기
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50"
            >
              메인 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">모임 만들기</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">모임 이름</label>
            <input
              type="text"
              placeholder="최대 50자"
              value={form.meetupName}
              onChange={set('meetupName')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">취미</label>
            <select
              value={form.hobbyName}
              onChange={set('hobbyName')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              required
            >
              <option value="">취미를 선택하세요</option>
              {hobbies.map((h) => (
                <option key={h.hobbyId} value={h.hobbyName}>
                  {h.hobbyName} ({h.inOutDoor})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">위치</label>
            <input
              type="text"
              placeholder="최대 30자"
              value={form.location}
              onChange={set('location')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">반복 규칙</label>
            <input
              type="text"
              placeholder="예: 매주 토요일, 격주"
              value={form.recurrenceRule}
              onChange={set('recurrenceRule')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">최대 인원</label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.maxParticipants}
              onChange={set('maxParticipants')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">모임 소개</label>
            <textarea
              placeholder="최대 255자"
              value={form.description}
              onChange={set('description')}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '생성 중...' : '모임 만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
