export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center gap-1 mt-8">
      <button
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100"
      >
        이전
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`px-3 py-1.5 rounded-lg border text-sm ${
            i === page
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        disabled={page === totalPages - 1}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100"
      >
        다음
      </button>
    </div>
  )
}