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

export const NAVIGATION = [
  {
    title: 'Coleccionista',
    items: [
      { to: '/explorar', label: 'Explorar', icon: Compass },
      { to: '/album', label: 'Mi álbum', icon: Library },
      { to: '/chats', label: 'Chats', icon: MessageCircle },
      { to: '/perfil', label: 'Mi perfil', icon: UserCircle },
    ],
  },
  {
    title: 'Administración',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
      { to: '/admin/moderacion', label: 'Moderación', icon: ShieldCheck },
      { to: '/admin/catalogo', label: 'Catálogo', icon: BookOpen },
    ],
  },
]
