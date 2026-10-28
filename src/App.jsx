function App() {
  return (
    <main
      style={{
        display: 'grid',
        placeContent: 'center',
        gap: 'var(--space-sm)',
        height: '100%',
        textAlign: 'center',
      }}
    >
      <span className="label">Coleccioná · Vendé · Intercambiá</span>
      <h1 className="text-gradient" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)' }}>
        Riolup TCG
      </h1>
      <p className="text-muted">El mercado de cartas de tu provincia.</p>
    </main>
  )
}

export default App
