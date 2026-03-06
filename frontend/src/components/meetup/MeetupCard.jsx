import { Link } from 'react-router-dom'

export default function MeetupCard({ meetup }) {
  return (
    <Link
      to={`/meetup/${meetup.meetupId}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
    >
      <div className="h-40 bg-gray-100 overflow-hidden">
        {meetup.thumbnail ? (
          <img
            src={`/uploads/thumbnails/${meetup.thumbnail}`}
            alt={meetup.meetupName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
            &#127919;
          </div>
        )}
      </div>
      <div className="p-4">
        {meetup.hobby && (
          <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
            {meetup.hobby}
          </span>
        )}
        <h3 className="mt-2 font-semibold text-gray-800 truncate">{meetup.meetupName}</h3>
        {meetup.location && (
          <p className="mt-1 text-sm text-gray-500 truncate">&#128205; {meetup.location}</p>
        )}
      </div>
    </Link>
  )
}
