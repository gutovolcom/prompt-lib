import { useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { FiltersProvider } from './hooks/useFilters'
import { Header } from './components/layout/Header'
import { ToastProvider } from './components/ui/Toast'
import { UploadModal } from './components/upload/UploadModal'
import { PromptDetailModal } from './components/prompt/PromptDetailModal'
import { Login } from './pages/Login'
import { Gallery } from './pages/Gallery'
import { Favorites } from './pages/Favorites'
import { Profile } from './pages/Profile'

const queryClient = new QueryClient()

export interface AppOutletContext {
  openUpload: () => void
}

// Tudo exceto /login exige sessão; redirect preservando o destino original.
function ProtectedLayout() {
  const { session, loading } = useAuth()
  const location = useLocation()
  const [uploadOpen, setUploadOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-text-2">
        Carregando...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return (
    <FiltersProvider>
      <Header onNewPrompt={() => setUploadOpen(true)} />
      <Outlet context={{ openUpload: () => setUploadOpen(true) } satisfies AppOutletContext} />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      {/* Sempre montado (como o UploadModal): deriva visibilidade da rota
          via useMatch para poder animar a saída antes de desmontar. */}
      <PromptDetailModal />
    </FiltersProvider>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Gallery />} />
                {/* Modal de detalhe deep-linkável: PromptDetailModal é montado
                    globalmente em ProtectedLayout e reage à rota via useMatch. */}
                <Route path="/p/:id" element={<Gallery />} />
                <Route path="/favoritos" element={<Favorites />} />
                <Route path="/perfil/:id" element={<Profile />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
