import { useState } from 'react'
import { createComment, updateComment, deleteComment } from '../../api/comment'
import { useAuth } from '../../context/AuthContext'

export default function CommentSection({ meetupId, comments = [], onUpdate }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      await createComment({ meetupId, content })
      setContent('')
      onUpdate()
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editing?.content.trim()) return
    setLoading(true)
    try {
      await updateComment({ commentId: editing.commentId, content: editing.content })
      setEditing(null)
      onUpdate()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    try {
      await deleteComment(commentId)
      onUpdate()
    } catch {
      alert('삭제 실패')
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">댓글 {comments.length}개</h3>

      <div className="space-y-3 mb-4">
        {comments.map((c) => (
          <div key={c.commentId} className="bg-gray-50 rounded-lg p-3">
            {editing?.commentId === c.commentId ? (
              <div className="flex gap-2">
                <input
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600"
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-xs font-medium text-indigo-600">{c.userName}</span>
                  <p className="text-sm text-gray-700 mt-1">{c.comment}</p>
                </div>
                {user?.username === c.userName && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setEditing({ commentId: c.commentId, content: c.comment })}
                      className="text-xs text-gray-400 hover:text-indigo-500"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(c.commentId)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {user && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="댓글을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <button
            onClick={handleCreate}
            disabled={loading || !content.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            등록
          </button>
        </div>
      )}
    </div>
  )
}
