import { createBrowserRouter } from 'react-router'
import { HomeRedirect } from '@/components/auth/HomeRedirect'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { AuthLayout } from '@/components/layout/AuthLayout/AuthLayout'
import { AppLayout } from '@/components/layout/AppLayout/AppLayout'
import { ROLES } from '@/data/constants'
import { CatalogAdminPage } from '@/pages/admin/CatalogAdminPage/CatalogAdminPage'
import { ModerationPage } from '@/pages/admin/ModerationPage/ModerationPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage/AdminUsersPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage/AdminDashboardPage'
import { AlbumPage } from '@/pages/album/AlbumPage/AlbumPage'
import { CatalogPage } from '@/pages/album/CatalogPage/CatalogPage'
import { ChatsPage } from '@/pages/chats/ChatsPage/ChatsPage'
import { ExplorePage } from '@/pages/explore/ExplorePage/ExplorePage'
import { ListingDetailPage } from '@/pages/explore/ListingDetailPage/ListingDetailPage'
import { LoginPage } from '@/pages/auth/LoginPage/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage/RegisterPage'
import { PublishPage } from '@/pages/publish/PublishPage/PublishPage'
import { EditProfilePage } from '@/pages/profile/EditProfilePage/EditProfilePage'
import { ProfilePage } from '@/pages/profile/ProfilePage/ProfilePage'
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
      { path: 'usuarios/:userId', element: <ProfilePage /> },
      { path: 'ui-kit', element: <UiKitPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'publicar', element: <PublishPage /> },
          { path: 'album', element: <AlbumPage /> },
          { path: 'album/catalogo', element: <CatalogPage /> },
          { path: 'chats/:conversationId?', element: <ChatsPage /> },
          { path: 'perfil', element: <ProfilePage /> },
          { path: 'perfil/editar', element: <EditProfilePage /> },
        ],
      },
      {
        path: 'admin',
        element: <RequireAuth roles={[ROLES.ADMIN]} />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'usuarios', element: <AdminUsersPage /> },
          { path: 'moderacion', element: <ModerationPage /> },
          { path: 'catalogo', element: <CatalogAdminPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
