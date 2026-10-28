import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import App from '../App.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
