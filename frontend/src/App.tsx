import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ToastProvider } from './context/ToastContext'  // 👈 IMPORTAR
import { ToastContainer } from './components/common/ToastContainer'  // 👈 IMPORTAR
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { IglesiaDashboard } from './pages/IglesiaDashboard'
import { FeedPage } from './pages/FeedPage'
import { PrayersPage } from './pages/PrayersPage'
import { ProfilePage } from './pages/ProfilePage'
import './App.css'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>  {/* 👈 ENVOLVER */}
            <ToastContainer />  {/* 👈 RENDERIZAR TOASTS */}
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <IglesiaDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/feed" 
                element={
                  <ProtectedRoute>
                    <FeedPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/prayers" 
                element={
                  <ProtectedRoute>
                    <PrayersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App