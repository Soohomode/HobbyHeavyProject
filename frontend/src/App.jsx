import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MeetupDetailPage from './pages/MeetupDetailPage'
import MeetupCreatePage from './pages/MeetupCreatePage'
import MeetupEditPage from './pages/MeetupEditPage'
import MyPage from './pages/MyPage'
import NotificationsPage from './pages/NotificationsPage'
import SchedulesPage from './pages/SchedulesPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="meetup/:meetupId" element={<MeetupDetailPage />} />
        <Route
          path="meetup/create"
          element={<PrivateRoute><MeetupCreatePage /></PrivateRoute>}
        />
        <Route
          path="meetup/edit/:meetupId"
          element={<PrivateRoute><MeetupEditPage /></PrivateRoute>}
        />
        <Route path="my" element={<PrivateRoute><MyPage /></PrivateRoute>} />
        <Route
          path="notifications"
          element={<PrivateRoute><NotificationsPage /></PrivateRoute>}
        />
        <Route
          path="schedules"
          element={<PrivateRoute><SchedulesPage /></PrivateRoute>}
        />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}