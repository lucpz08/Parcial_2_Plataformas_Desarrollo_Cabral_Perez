import { useState } from 'react'
import { Mail, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Chip,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Modal,
  Panel,
  Select,
  Skeleton,
  StarRating,
  Tabs,
  Textarea,
} from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { CardTile } from '@/components/cards/CardTile/CardTile'
import { useToast } from '@/hooks/useToast'
import { useDatabase } from '@/hooks/useDatabase'
import { CONDITIONS, PROVINCES } from '@/data/constants'

const section = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-sm)' }

export function UiKitPage() {
  const toast = useToast()
  const { cards } = useDatabase()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rating, setRating] = useState(4)
  const [tab, setTab] = useState('todas')
  const [intent, setIntent] = useState('vender')
  const [selectedCard, setSelectedCard] = useState(null)

  return (
    <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
      <PageHeader eyebrow="Sistema de diseño" title="UI Kit" subtitle="Componentes base de Riolup TCG" />

      <Panel title="Botones" subtitle="Variantes, tamaños y estados">
        <div style={section}>
          <Button icon={Plus}>Publicar carta</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger" icon={Trash2}>Eliminar</Button>
          <Button variant="gold">Destacar</Button>
          <Button loading>Guardando</Button>
          <Button size="sm">Chico</Button>
          <Button size="lg">Grande</Button>
          <Button variant="outline" icon={Search} aria-label="Buscar" />
        </div>
      </Panel>

      <Panel title="Formularios">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
          <Field label="Email" required hint="Usá el email con el que te registraste">
            <Input icon={Mail} placeholder="vos@ejemplo.com" />
          </Field>
          <Field label="Contraseña" error="La contraseña es incorrecta">
            <Input type="password" defaultValue="secreto" />
          </Field>
          <Field label="Provincia">
            <Select options={PROVINCES} placeholder="Elegí tu provincia" />
          </Field>
          <Field label="Estado de la carta">
            <Select options={CONDITIONS} />
          </Field>
          <Field label="Descripción" className="full">
            <Textarea placeholder="Contá algo sobre la carta..." />
          </Field>
        </div>
      </Panel>

      <Panel title="Badges, chips, tabs y avatares">
        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          <div style={section}>
            <Badge tone="primary">Vender</Badge>
            <Badge tone="success">Cambiar</Badge>
            <Badge tone="gold">Busco</Badge>
            <Badge tone="success" dot>Disponible</Badge>
            <Badge tone="warning" dot>Reservado</Badge>
            <Badge tone="danger" variant="solid">Suspendido</Badge>
            <Badge tone="primary" variant="outline" icon={ShieldCheck}>Verificada</Badge>
          </div>
          <div style={section}>
            {['vender', 'cambiar', 'busco'].map((value) => (
              <Chip key={value} selected={intent === value} onClick={() => setIntent(value)}>
                {value}
              </Chip>
            ))}
          </div>
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'todas', label: 'Todas', count: 24 },
              { value: 'verificadas', label: 'Verificadas', count: 6 },
              { value: 'pendientes', label: 'Pendientes', count: 3 },
            ]}
          />
          <div style={section}>
            <Avatar name="Matías Ríos" />
            <Avatar name="Camila Sosa" online />
            <Avatar name="Nicolás Gómez" size={56} />
            <StarRating value={4.5} count={12} showValue />
            <StarRating value={rating} onChange={setRating} size={22} />
          </div>
        </div>
      </Panel>

      <Panel title="Modales y notificaciones">
        <div style={section}>
          <Button variant="outline" onClick={() => setModalOpen(true)}>Abrir modal</Button>
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>Confirmar eliminación</Button>
          <Button variant="outline" onClick={() => toast.success('Carta agregada', 'Charizard se sumó a tu álbum.')}>Toast éxito</Button>
          <Button variant="outline" onClick={() => toast.error('No se pudo reservar', 'La carta ya fue reservada.')}>Toast error</Button>
          <Button variant="outline" onClick={() => toast.info('Nuevo mensaje', 'Camila te escribió.')}>Toast info</Button>
        </div>
      </Panel>

      <Panel title="Cartas" subtitle="Pasá el mouse por encima de una carta">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 'var(--space-md)' }}>
          {cards.slice(0, 6).map((card) => (
            <CardTile
              key={card.id}
              card={card}
              selected={selectedCard === card.id}
              onClick={() => setSelectedCard(card.id)}
              badges={<Badge tone="primary">{card.rarity}</Badge>}
            />
          ))}
        </div>
      </Panel>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        <EmptyState
          title="Tu álbum está vacío"
          description="Buscá cartas en el catálogo y agregalas a tu colección."
          action={<Button icon={Plus}>Agregar carta</Button>}
        />
        <Panel title="Cargando">
          <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
            <Skeleton height={20} width="60%" />
            <Skeleton />
            <Skeleton />
            <Skeleton width="80%" />
          </div>
        </Panel>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Agregar al álbum"
        description="Elegí el estado y el idioma de la carta."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => setModalOpen(false)}>Agregar</Button>
          </>
        }
      >
        <Field label="Estado">
          <Select options={CONDITIONS} />
        </Field>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          toast.success('Publicación eliminada')
        }}
        title="¿Eliminar publicación?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        danger
      />
    </div>
  )
}
