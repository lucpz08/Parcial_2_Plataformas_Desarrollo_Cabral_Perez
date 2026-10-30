import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { LogIn, Menu, Search, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { NotificationsMenu } from '../NotificationsMenu/NotificationsMenu'
import { UserMenu } from '../UserMenu/UserMenu'
import styles from './Topbar.module.css'

export function Topbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  function handleSearch(event) {
    event.preventDefault()
    const text = query.trim()
    navigate(text ? `/explorar?q=${encodeURIComponent(text)}` : '/explorar')
  }

  return (
    <header className={styles.topbar}>
      <button type="button" className={styles.menu} onClick={onMenuClick} aria-label="Abrir menú">
        <Menu size={22} />
      </button>

      <form className={styles.search} onSubmit={handleSearch} role="search">
        <Search size={18} className={styles.searchIcon} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscá una carta: Charizard, Umbreon, Pikachu..."
          aria-label="Buscar cartas publicadas"
        />
        <kbd className={styles.kbd}>Enter</kbd>
      </form>

      <div className={styles.actions}>
        {user ? (
          <>
            <NotificationsMenu />
            <UserMenu />
          </>
        ) : (
          <>
            <Button as={Link} to="/login" variant="ghost" icon={LogIn}>
              Ingresar
            </Button>
            <Button as={Link} to="/registro" icon={UserPlus} className={styles.registerButton}>
              Crear cuenta
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
