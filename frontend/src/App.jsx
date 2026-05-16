import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import AiAdvisor from './pages/AiAdvisor.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Goals from './pages/Goals.jsx'
import Liabilities from './pages/Liabilities.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import Register from './pages/Register.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Transactions from './pages/Transactions.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <>
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/liabilities" element={<Liabilities />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/advisor" element={<AiAdvisor />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      
    </Routes>
    <Footer />
    </>

    
  )
}
