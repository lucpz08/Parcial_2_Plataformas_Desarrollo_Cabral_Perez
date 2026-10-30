import {
  BookOpen,
  Compass,
  LayoutDashboard,
  Library,
  MessageCircle,
  ShieldCheck,
  Sparkles,
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
    requiresAuth: true,
    items: [
      { to: '/album', label: 'Mi álbum', icon: Library },
      { to: '/coincidencias', label: 'Coincidencias', icon: Sparkles, badge: 'matches' },
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
      { to: '/admin/moderacion', label: 'Moderación', icon: ShieldCheck, badge: 'moderationQueue' },
      { to: '/admin/catalogo', label: 'Catálogo', icon: BookOpen },
    ],
  },
]

export function getNavigationFor(user) {
  return NAVIGATION.filter((group) => {
    if (group.roles) return Boolean(user) && group.roles.includes(user.role)
    if (group.requiresAuth) return Boolean(user)
    return true
  })
}
