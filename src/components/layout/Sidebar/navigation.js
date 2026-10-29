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
import { ROLES } from '@/data/constants'

export const NAVIGATION = [
  {
    title: 'Mercado',
    items: [{ to: '/explorar', label: 'Explorar', icon: Compass }],
  },
  {
    title: 'Mi colección',
    roles: [ROLES.COLECCIONISTA],
    items: [
      { to: '/album', label: 'Mi álbum', icon: Library },
      { to: '/chats', label: 'Chats', icon: MessageCircle, badge: 'unreadMessages' },
      { to: '/perfil', label: 'Mi perfil', icon: UserCircle },
    ],
  },
  {
    title: 'Administración',
    roles: [ROLES.ADMIN],
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
      { to: '/admin/moderacion', label: 'Moderación', icon: ShieldCheck },
      { to: '/admin/catalogo', label: 'Catálogo', icon: BookOpen },
    ],
  },
]

export function getNavigationFor(user) {
  return NAVIGATION.filter((group) => !group.roles || (user && group.roles.includes(user.role)))
}
