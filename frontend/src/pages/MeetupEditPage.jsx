import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMeetup, updateMeetup, uploadThumbnail } from '../api/meetup'

export default function MeetupEditPage() {
  const { meetupId } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    meetupName: '',
    description: '',
    location: '',
    recurrenceRule: '',
    maxParticipants: 10,
  })
  const [thumbnail, setThumbnail] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getMeetup(meetupId).then((res) => {
      const m = res.data
      setForm({
        meetupName: m.meetupName || '',
        description: m.description || '',
        location: m.location || '',
        recurrenceRule: m.recurrenceRule || '',
        maxParticipants: m.maxParticipants || 10,
      })
    })
  }, [meetupId])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await updateMeetup(meetupId, { ...form, maxParticipants: Number(form.maxParticipants) })
      if (thumbnail) {
        const fd = new FormData()
        fd.append('image', thumbnail)
        await uploadThumbnail(meetupId, fd)
      }
      navigate(`/meetup/${meetupId}`)
    } catch (e) {
      setError(e.response?.data || '수정에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">모임 수정</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: '모임 이름', field: 'meetupName', type: 'text' },
            { label: '위치', field: 'location', type: 'text' },
            { label: '반복 규칙', field: 'recurrenceRule', type: 'text' },
            { label: '최대 인원', field: 'maxParticipants', type: 'number' },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={set(field)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">모임 소개</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              썸네일 이미지 변경
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="text-sm text-gray-600"
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
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
