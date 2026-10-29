import { createBrowserRouter } from 'react-router'
import {
  BookOpen,
  LayoutDashboard,
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
import { AlbumPage } from '@/pages/album/AlbumPage/AlbumPage'
import { CatalogPage } from '@/pages/album/CatalogPage/CatalogPage'
import { ExplorePage } from '@/pages/explore/ExplorePage/ExplorePage'
import { ListingDetailPage } from '@/pages/explore/ListingDetailPage/ListingDetailPage'
import { LoginPage } from '@/pages/auth/LoginPage/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage/RegisterPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { PublishPage } from '@/pages/publish/PublishPage/PublishPage'
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
      { path: 'explorar', element: <ExplorePage /> },
      { path: 'explorar/:listingId', element: <ListingDetailPage /> },
      {
        path: 'usuarios/:userId',
        element: <PlaceholderPage eyebrow="Comunidad" title="Perfil público" icon={UserCircle} />,
      },
      { path: 'ui-kit', element: <UiKitPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'publicar', element: <PublishPage /> },
          { path: 'album', element: <AlbumPage /> },
          { path: 'album/catalogo', element: <CatalogPage /> },
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
