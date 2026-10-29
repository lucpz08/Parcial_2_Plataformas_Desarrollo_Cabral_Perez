import { Link, useRouteError } from 'react-router'
import { ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui'
import { LogoMark } from '@/components/layout/Logo/Logo'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './NotFoundPage.module.css'

export function NotFoundPage({
  code = '404',
  title = 'Esta carta no está en el mazo',
  message = 'La página que buscás no existe o fue movida.',
}) {
  useDocumentTitle(title)

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.mark}>
          <LogoMark size={88} />
        </div>
        <span className={styles.code}>{code}</span>
        <h1>{title}</h1>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="outline" icon={ArrowLeft} onClick={() => window.history.back()}>
            Volver
          </Button>
          <Button as={Link} to="/explorar" icon={Compass}>
            Ir a explorar
          </Button>
        </div>
      </div>
    </div>
  )
}

export function RouteErrorPage() {
  const error = useRouteError()
  const isNotFound = error?.status === 404

  if (isNotFound) return <NotFoundPage />

  return (
    <NotFoundPage
      code="Error"
      title="Algo salió mal"
      message="Ocurrió un error inesperado. Probá recargar la página."
    />
  )
}
