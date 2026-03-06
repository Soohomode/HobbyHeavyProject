import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMeetup } from '../api/meetup'

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
  const navigate = useNavigate()

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createMeetup({ ...form, maxParticipants: Number(form.maxParticipants) })
      navigate('/')
    } catch (e) {
      setError(e.response?.data || '모임 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
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
            <input
              type="text"
              placeholder="예: 등산, 독서, 요가"
              value={form.hobbyName}
              onChange={set('hobbyName')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
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
