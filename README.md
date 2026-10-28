# Riolup TCG — Frontend

Single-page application para comprar, vender e intercambiar cartas coleccionables entre coleccionistas.
Parcial 2 de Plataformas de Desarrollo (comisión ACN4AP) — Cabral, Pérez.

Construida solo con tecnologías de frontend: **HTML, CSS y JavaScript** (React + Vite).
No hay backend: los datos están hardcodeados y se guardan en el `localStorage` del navegador.

## Cómo correrlo

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # genera la carpeta dist/ con HTML, CSS y JS compilados
npm run preview  # sirve el build localmente
```

## Estructura

```
src/
├── components/
│   ├── layout/   # Sidebar, Topbar y layouts de página
│   └── ui/       # Componentes reutilizables (Button, Input, Modal, ...)
├── context/      # Estado global (sesión del usuario, notificaciones)
├── data/         # Datos mock iniciales
├── hooks/        # Hooks personalizados
├── pages/        # Una carpeta por pantalla
├── services/     # Acceso a datos (localStorage)
├── styles/       # CSS global y tokens de diseño
└── utils/        # Funciones auxiliares
```
"# Parcial_2_Plataformas_Desarrollo_Cabral_Perez" 
