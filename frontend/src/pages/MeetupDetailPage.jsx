import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getMeetup, deleteMeetup, uploadThumbnail } from '../api/meetup'
import {
  joinMeetup,
  cancelWaiting,
  withdrawFromMeetup,
  getWaitingParticipants,
  setParticipantStatus,
} from '../api/participant'
import { getAllSchedules, createSchedule } from '../api/schedule'
import { createReview } from '../api/review'
import { useAuth } from '../context/AuthContext'
import CommentSection from '../components/comment/CommentSection'
import ScheduleCard from '../components/schedule/ScheduleCard'
import Modal from '../components/common/Modal'

export default function MeetupDetailPage() {
  const { meetupId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [meetup, setMeetup] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [waiting, setWaiting] = useState([])
  const [loading, setLoading] = useState(true)

  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const [scheduleForm, setScheduleForm] = useState({
    proposalDate: '',
    activateTime: '',
    location: '',
    votingDeadline: '',
  })
  const [reviewForm, setReviewForm] = useState({ scheduleId: '', rating: 5, content: '' })

  const isHost = user && meetup?.hostName === user.userId
  const isApproved = meetup?.participants?.some(
    (p) => p.userId === user?.userId && p.status === 'APPROVED',
  )
  const isWaiting = meetup?.participants?.some(
    (p) => p.userId === user?.userId && p.status === 'WAITING',
  )

  const fetchMeetup = async () => {
    try {
      const res = await getMeetup(meetupId)
      setMeetup(res.data)
    } catch {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedules = async () => {
    try {
      const res = await getAllSchedules()
      setSchedules(res.data.filter((s) => s.meetupId === Number(meetupId)))
    } catch {}
  }

  const fetchWaiting = async () => {
    try {
      const res = await getWaitingParticipants(meetupId)
      setWaiting(res.data)
    } catch {}
  }

  useEffect(() => {
    fetchMeetup()
  }, [meetupId])

  useEffect(() => {
    if (user) fetchSchedules()
  }, [meetupId, user])

  useEffect(() => {
    if (isHost) fetchWaiting()
  }, [isHost])

  const handleJoin = async () => {
    try {
      await joinMeetup(meetupId)
      fetchMeetup()
    } catch (e) {
      alert(e.response?.data || '참가 신청 실패')
    }
  }

  const handleDelete = async () => {
    if (!confirm('모임을 삭제하시겠습니까?')) return
    try {
      await deleteMeetup(meetupId)
      navigate('/')
    } catch {
      alert('삭제 실패')
    }
  }

  const handleApprove = async (userId) => {
    try {
      await setParticipantStatus({ meetupId: Number(meetupId), userId, status: 'APPROVED' })
      fetchMeetup()
      fetchWaiting()
    } catch {
      alert('승인 실패')
    }
  }

  const handleReject = async (userId) => {
    try {
      await setParticipantStatus({ meetupId: Number(meetupId), userId, status: 'REJECTED' })
      fetchWaiting()
    } catch {
      alert('거절 실패')
    }
  }

  const handleCreateSchedule = async (e) => {
    e.preventDefault()
    try {
      await createSchedule({ meetupId: Number(meetupId), ...scheduleForm })
      setShowScheduleModal(false)
      setScheduleForm({ proposalDate: '', activateTime: '', location: '', votingDeadline: '' })
      fetchSchedules()
    } catch (e) {
      alert(e.response?.data?.message || '일정 생성 실패')
    }
  }

  const handleCreateReview = async (e) => {
    e.preventDefault()
    try {
      await createReview({ ...reviewForm, scheduleId: Number(reviewForm.scheduleId) })
      setShowReviewModal(false)
      setReviewForm({ scheduleId: '', rating: 5, content: '' })
      alert('리뷰가 작성되었습니다.')
    } catch (e) {
      alert(e.response?.data || '리뷰 작성 실패')
    }
  }

  if (loading)
    return <div className="text-center py-20 text-gray-400 animate-pulse">불러오는 중...</div>
  if (!meetup) return null

  const confirmedSchedules = schedules.filter((s) => s.status === 'CONFIRMED')

  return (
    <div className="max-w-3xl mx-auto">
      {/* 썸네일 */}
      <div className="h-60 bg-gray-100 rounded-xl overflow-hidden mb-6">
        {meetup.thumbnail ? (
          <img
            src={meetup.thumbnail}
            alt={meetup.meetupName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-7xl">
            &#127919;
          </div>
        )}
      </div>

      {/* 헤더 */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{meetup.meetupName}</h1>
          <p className="text-gray-500 mt-1">
            &#128205; {meetup.location} &middot; 호스트: {meetup.hostName}
          </p>
          <p className="text-gray-400 text-sm mt-0.5">
            최대 {meetup.maxParticipants}명 &middot; {meetup.recurrenceRule}
          </p>
        </div>
        {isHost && (
          <div className="flex gap-2 shrink-0">
            <Link
              to={`/meetup/edit/${meetupId}`}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              className="text-sm px-3 py-1.5 border border-red-300 rounded-lg text-red-500 hover:bg-red-50"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 설명 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
        <h2 className="font-semibold text-gray-700 mb-2">모임 소개</h2>
        <p className="text-gray-600 text-sm leading-relaxed">{meetup.description}</p>
      </div>

      {/* 참가 액션 */}
      {user && !isHost && (
        <div className="mb-5 flex gap-3 items-center">
          {!isApproved && !isWaiting && (
            <button
              onClick={handleJoin}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              참가 신청
            </button>
          )}
          {isWaiting && (
            <>
              <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg">
                대기 중
              </span>
              <button
                onClick={async () => {
                  try {
                    await cancelWaiting(meetupId)
                    fetchMeetup()
                  } catch {
                    alert('취소 실패')
                  }
                }}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                대기 취소
              </button>
            </>
          )}
          {isApproved && (
            <>
              <span className="text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg font-medium">
                참가 승인됨
              </span>
              <button
                onClick={async () => {
                  if (!confirm('모임에서 탈퇴하시겠습니까?')) return
                  try {
                    await withdrawFromMeetup(meetupId)
                    fetchMeetup()
                  } catch {
                    alert('탈퇴 실패')
                  }
                }}
                className="text-sm px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
              >
                탈퇴
              </button>
            </>
          )}
        </div>
      )}

      {/* 참가자 목록 */}
      {meetup.participants?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
          <h2 className="font-semibold text-gray-700 mb-3">
            참가자 ({meetup.participants.length}명)
          </h2>
          <div className="flex flex-wrap gap-2">
            {meetup.participants.map((p, i) => (
              <span
                key={i}
                className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-600"
              >
                {p.userId} {p.meetupRole === 'HOST' && '&#128081;'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 대기자 목록 (호스트) */}
      {isHost && waiting.length > 0 && (
        <div className="bg-white rounded-xl border border-yellow-100 p-5 mb-5">
          <h2 className="font-semibold text-gray-700 mb-3">
            승인 대기 ({waiting.length}명)
          </h2>
          <div className="space-y-2">
            {waiting.map((w) => (
              <div key={w.userId} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{w.userId}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(w.userId)}
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(w.userId)}
                    className="text-xs px-3 py-1 border border-red-300 text-red-500 rounded-lg"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 일정 */}
      {user && (
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">일정</h2>
            {(isHost || isApproved) && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                + 일정 제안
              </button>
            )}
          </div>
          {schedules.length === 0 ? (
            <p className="text-sm text-gray-400">제안된 일정이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => (
                <ScheduleCard
                  key={s.scheduleId}
                  schedule={s}
                  isHost={isHost}
                  onUpdate={fetchSchedules}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 리뷰 작성 */}
      {isApproved && confirmedSchedules.length > 0 && (
        <div className="mb-5">
          <button
            onClick={() => setShowReviewModal(true)}
            className="text-sm px-4 py-2 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50"
          >
            + 리뷰 작성
          </button>
        </div>
      )}

      {/* 댓글 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <CommentSection
          meetupId={Number(meetupId)}
          comments={meetup.comments || []}
          onUpdate={fetchMeetup}
        />
      </div>

      {/* 일정 제안 모달 */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="일정 제안"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">날짜/시간</label>
            <input
              type="datetime-local"
              value={scheduleForm.proposalDate}
              onChange={(e) => setScheduleForm({ ...scheduleForm, proposalDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">활동 시간</label>
            <input
              type="text"
              placeholder="예: 2시간"
              value={scheduleForm.activateTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, activateTime: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
            <input
              type="text"
              placeholder="예: 서울 홍대입구"
              value={scheduleForm.location}
              onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">투표 마감</label>
            <input
              type="text"
              placeholder="예: 3시간, 1일"
              value={scheduleForm.votingDeadline}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, votingDeadline: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700"
          >
            제안하기
          </button>
        </form>
      </Modal>

      {/* 리뷰 작성 모달 */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="리뷰 작성"
      >
        <form onSubmit={handleCreateReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">일정 선택</label>
            <select
              value={reviewForm.scheduleId}
              onChange={(e) => setReviewForm({ ...reviewForm, scheduleId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            >
              <option value="">선택하세요</option>
              {confirmedSchedules.map((s) => (
                <option key={s.scheduleId} value={s.scheduleId}>
                  {new Date(s.proposalDate).toLocaleDateString('ko-KR')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">별점</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                  className={`text-3xl leading-none ${
                    n <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-200'
                  }`}
                >
                  &#9733;
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
            <textarea
              value={reviewForm.content}
              onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700"
          >
            작성하기
          </button>
        </form>
      </Modal>
    </div>
  )
}
