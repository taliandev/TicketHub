import { Routes, Route } from 'react-router-dom'

// Layouts
import MainLayout from './components/layouts/MainLayout'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import Events from './pages/Events'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'
import EventDetail from './pages/EventDetail'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'
import PaymentConfirmation from './pages/PaymentConfirmation'
import PaymentSuccess from './pages/PaymentSuccess'
import CheckIn from './pages/CheckIn'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Dashboard Routes - Shared by Admin and Organizer */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole={['admin', 'organizer']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Check-in Route - For Admin and Organizer */}
        <Route 
          path="/checkin" 
          element={
            <ProtectedRoute requiredRole={['admin', 'organizer']}>
              <CheckIn />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  )
}

export default App 