import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bell, LogIn, Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui'
import styles from './Topbar.module.css'

export function Topbar({ onMenuClick }) {
  const navigate = useNavigate()
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
        <button type="button" className={styles.iconButton} aria-label="Notificaciones">
          <Bell size={20} />
        </button>
        <Button as={Link} to="/login" variant="secondary" icon={LogIn}>
          Ingresar
        </Button>
      </div>
    </header>
  )
}
