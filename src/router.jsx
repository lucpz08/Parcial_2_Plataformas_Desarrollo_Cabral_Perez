import { createBrowserRouter } from 'react-router'
import {
  BookOpen,
  Compass,
  LayoutDashboard,
  Library,
  MessageCircle,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react'
import { HomeRedirect } from '@/components/auth/HomeRedirect'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { AuthLayout } from '@/components/layout/AuthLayout/AuthLayout'
import { AppLayout } from '@/components/layout/AppLayout/AppLayout'
import { ROLES } from '@/data/constants'
import { LoginPage } from '@/pages/auth/LoginPage/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage/RegisterPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { NotFoundPage, RouteErrorPage } from '@/pages/NotFoundPage/NotFoundPage'
import { UiKitPage } from '@/pages/UiKitPage/UiKitPage'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'registro', element: <RegisterPage /> },
    ],
  },
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        path: 'explorar',
        element: <PlaceholderPage eyebrow="Mercado" title="Explorar" subtitle="Cartas publicadas por coleccionistas de todo el país" icon={Compass} />,
      },
      {
        path: 'explorar/:listingId',
        element: <PlaceholderPage eyebrow="Mercado" title="Publicación" icon={Compass} />,
      },
      {
        path: 'usuarios/:userId',
        element: <PlaceholderPage eyebrow="Comunidad" title="Perfil público" icon={UserCircle} />,
      },
      { path: 'ui-kit', element: <UiKitPage /> },
      {
        element: <RequireAuth roles={[ROLES.COLECCIONISTA]} />,
        children: [
          {
            path: 'publicar',
            element: <PlaceholderPage eyebrow="Mercado" title="Publicar carta" icon={Compass} />,
          },
          {
            path: 'album',
            element: <PlaceholderPage eyebrow="Colección" title="Mi álbum" subtitle="Todas las cartas de tu colección" icon={Library} />,
          },
          {
            path: 'album/catalogo',
            element: <PlaceholderPage eyebrow="Colección" title="Catálogo de cartas" icon={Library} />,
          },
          {
            path: 'chats',
            element: <PlaceholderPage eyebrow="Mensajes" title="Chats" icon={MessageCircle} />,
          },
          {
            path: 'chats/:conversationId',
            element: <PlaceholderPage eyebrow="Mensajes" title="Conversación" icon={MessageCircle} />,
          },
          {
            path: 'perfil',
            element: <PlaceholderPage eyebrow="Cuenta" title="Mi perfil" icon={UserCircle} />,
          },
          {
            path: 'perfil/editar',
            element: <PlaceholderPage eyebrow="Cuenta" title="Editar perfil" icon={UserCircle} />,
          },
        ],
      },
      {
        path: 'admin',
        element: <RequireAuth roles={[ROLES.ADMIN]} />,
        children: [
          {
            index: true,
            element: <PlaceholderPage eyebrow="Administración" title="Dashboard" subtitle="Métricas generales de la plataforma" icon={LayoutDashboard} />,
          },
          {
            path: 'usuarios',
            element: <PlaceholderPage eyebrow="Administración" title="Gestión de usuarios" icon={Users} />,
          },
          {
            path: 'moderacion',
            element: <PlaceholderPage eyebrow="Administración" title="Moderación" icon={ShieldCheck} />,
          },
          {
            path: 'catalogo',
            element: <PlaceholderPage eyebrow="Administración" title="Catálogo" icon={BookOpen} />,
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
