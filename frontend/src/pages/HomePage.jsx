import { useEffect, useState } from 'react'
import { getMeetups, getMeetupsByHobby, searchMeetups, getMeetupsByLocation } from '../api/meetup'
import MeetupCard from '../components/meetup/MeetupCard'
import Pagination from '../components/common/Pagination'

const TABS = [
  { key: 'new', label: '최신순' },
  { key: 'hobby', label: '취미별' },
  { key: 'location', label: '지역별' },
  { key: 'search', label: '검색' },
]

const PLACEHOLDERS = {
  hobby: '취미명 (예: 등산)',
  location: '지역명 (예: 서울)',
  search: '검색어를 입력하세요',
}

export default function HomePage() {
  const [tab, setTab] = useState('new')
  const [query, setQuery] = useState('')
  const [input, setInput] = useState('')
  const [meetups, setMeetups] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchMeetups = async (p = 0) => {
    setLoading(true)
    try {
      let res
      if (tab === 'new') {
        res = await getMeetups(p, 12)
      } else if (query) {
        if (tab === 'hobby') res = await getMeetupsByHobby(query, p, 12)
        else if (tab === 'location') res = await getMeetupsByLocation(query, p, 12)
        else if (tab === 'search') res = await searchMeetups(query, p, 12)
      } else {
        setMeetups([])
        return
      }
      setMeetups(res.data.content || [])
      setTotalPages(res.data.totalPages || 0)
    } catch {
      setMeetups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
    fetchMeetups(0)
  }, [tab, query])

  const handleTabChange = (t) => {
    setTab(t)
    setQuery('')
    setInput('')
  }

  const handleSearch = () => setQuery(input.trim())

  const handlePageChange = (p) => {
    setPage(p)
    fetchMeetups(p)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">취미 모임 찾기</h1>
        <p className="text-gray-500 mt-1">관심 있는 취미 모임에 참여해보세요</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 검색바 */}
      {tab !== 'new' && (
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder={PLACEHOLDERS[tab]}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleSearch}
            className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
          >
            검색
          </button>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-52 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : meetups.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">&#127919;</p>
          <p className="text-base">
            {tab === 'new' ? '모임이 없습니다.' : '검색 결과가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {meetups.map((m) => (
            <MeetupCard key={m.meetupId} meetup={m} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
    </div>
  )
}
