import { useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { cx } from '@/utils/cx'
import { Sidebar } from '../Sidebar/Sidebar'
import { Topbar } from '../Topbar/Topbar'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.layout}>
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div
        className={cx(styles.backdrop, sidebarOpen && styles.backdropVisible)}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />
      <div className={styles.main}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}
