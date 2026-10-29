import { Link, useNavigate } from 'react-router'
import { ArrowLeft, PackageX, SearchX } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Alert, Button, EmptyState } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { cardsService } from '@/services/cards'
import { collectionService } from '@/services/collection'
import { listingsService } from '@/services/listings'
import { usersService } from '@/services/users'
import { pluralize } from '@/utils/format'
import { ListingForm } from './ListingForm'

function BackButton({ onClick, to, children }) {
  const props = to ? { as: Link, to } : { onClick }
  return (
    <Button variant="ghost" icon={ArrowLeft} {...props}>
      {children}
    </Button>
  )
}

function getSeller(user) {
  return usersService.toPublic(usersService.findById(user.id))
}

export function CollectionMode({ itemIds, user, onPublished, onBack }) {
  const toast = useToast()
  const items = collectionService.getByUser(user.id)
  const selected = itemIds.map((id) => items.find((item) => item.id === id)).filter(Boolean)
  const publishable = selected.filter((item) => item.card && !item.openListing)
  const skipped = itemIds.length - publishable.length

  const header = (
    <PageHeader
      eyebrow="Publicar"
      title={publishable.length > 1 ? `Publicar ${publishable.length} cartas` : 'Publicar carta'}
      subtitle="Elegí si las vendés o las cambiás. Vas a poder editarlas mientras estén disponibles."
      actions={<BackButton onClick={onBack}>Elegir otras</BackButton>}
    />
  )

  if (publishable.length === 0) {
    return (
      <>
        {header}
        <EmptyState
          icon={PackageX}
          title="No hay cartas para publicar"
          description="Las cartas elegidas ya están publicadas o no forman parte de tu álbum."
          action={
            <Button as={Link} to="/album">
              Ir a mi álbum
            </Button>
          }
        />
      </>
    )
  }

  const entries = publishable.map((item) => ({ key: item.id, card: item.card, collectionItem: item }))

  function handleSubmit(values) {
    const created = listingsService.publishFromCollection({
      userId: user.id,
      entries: entries.map((entry) => ({ collectionItemId: entry.key, price: values.prices[entry.key] })),
      intent: values.intent,
      description: values.description,
      province: values.province,
    })
    toast.success(created.length > 1 ? `¡Publicaste ${created.length} cartas!` : '¡Carta publicada!')
    onPublished(created)
  }

  return (
    <>
      {header}
      {skipped > 0 && (
        <Alert tone="warning" title={`${pluralize(skipped, 'carta quedó afuera', 'cartas quedaron afuera')}`}>
          Ya tenían una publicación activa o no están en tu álbum.
        </Alert>
      )}
      <ListingForm
        key={entries.map((entry) => entry.key).join()}
        entries={entries}
        allowedIntents={['vender', 'cambiar']}
        initialValues={{ intent: 'vender', prices: {}, description: '', province: user.province ?? '' }}
        seller={getSeller(user)}
        submitLabel={entries.length > 1 ? `Publicar ${entries.length} cartas` : 'Publicar carta'}
        onSubmit={handleSubmit}
        onCancel={onBack}
      />
    </>
  )
}

export function WantedMode({ cardId, user, onPublished, onBack }) {
  const toast = useToast()
  const card = cardsService.findById(cardId)
  const alreadyWanted = card ? listingsService.hasOpenWanted(user.id, card.id) : false

  const header = (
    <PageHeader
      eyebrow="Publicar"
      title="Publicar que buscás una carta"
      subtitle="Quienes la tengan van a poder ofrecértela desde Explorar."
      actions={<BackButton onClick={onBack}>Elegir otra</BackButton>}
    />
  )

  if (!card || !card.active) {
    return (
      <>
        {header}
        <EmptyState
          icon={SearchX}
          title="No encontramos esa carta"
          description="Puede que ya no esté en el catálogo de Riolup."
          action={<Button onClick={onBack}>Buscar otra carta</Button>}
        />
      </>
    )
  }

  function handleSubmit(values) {
    const listing = listingsService.createWanted({
      userId: user.id,
      cardId: card.id,
      price: values.prices[card.id],
      description: values.description,
      province: values.province,
    })
    toast.success('¡Publicaste que buscás esta carta!')
    onPublished([listing])
  }

  return (
    <>
      {header}
      {alreadyWanted && (
        <Alert tone="warning" title="Ya estás buscando esta carta">
          Tenés una publicación activa para {card.name}. Podés editarla desde su detalle en lugar de crear otra.
        </Alert>
      )}
      <ListingForm
        key={card.id}
        entries={[{ key: card.id, card, collectionItem: null }]}
        allowedIntents={['busco']}
        initialValues={{ intent: 'busco', prices: {}, description: '', province: user.province ?? '' }}
        seller={getSeller(user)}
        submitLabel="Publicar búsqueda"
        onSubmit={handleSubmit}
        onCancel={onBack}
      />
    </>
  )
}

export function EditMode({ listingId, user }) {
  const navigate = useNavigate()
  const toast = useToast()
  const listing = listingsService.getDetailed(listingId)
  const detailPath = `/explorar/${listingId}`

  const header = (
    <PageHeader
      eyebrow="Publicar"
      title="Editar publicación"
      subtitle="Los cambios se ven al instante en Explorar."
      actions={<BackButton to={listing ? detailPath : '/explorar'}>Volver</BackButton>}
    />
  )

  if (!listing || !listing.card || listing.userId !== user.id) {
    return (
      <>
        {header}
        <EmptyState
          icon={PackageX}
          title="No podés editar esta publicación"
          description="No existe o pertenece a otro coleccionista."
          action={
            <Button as={Link} to="/explorar">
              Ir a Explorar
            </Button>
          }
        />
      </>
    )
  }

  if (listing.status !== 'disponible') {
    return (
      <>
        {header}
        <Alert tone="warning" title="Esta publicación ya no se puede editar">
          Solo se editan publicaciones disponibles. Si está reservada, liberá la reserva desde el detalle.
        </Alert>
        <div>
          <Button as={Link} to={detailPath}>
            Ver publicación
          </Button>
        </div>
      </>
    )
  }

  function handleSubmit(values) {
    listingsService.edit(listing.id, user.id, {
      intent: values.intent,
      price: values.prices[listing.id],
      description: values.description,
      province: values.province,
    })
    toast.success('Publicación actualizada')
    navigate(detailPath)
  }

  return (
    <>
      {header}
      <ListingForm
        key={listing.id}
        entries={[{ key: listing.id, card: listing.card, collectionItem: listing.collectionItem }]}
        allowedIntents={listing.collectionItemId ? ['vender', 'cambiar'] : ['busco']}
        initialValues={{
          intent: listing.intent,
          prices: { [listing.id]: listing.price != null ? String(listing.price) : '' },
          description: listing.description ?? '',
          province: listing.province ?? '',
        }}
        seller={getSeller(user)}
        submitLabel="Guardar cambios"
        onSubmit={handleSubmit}
        onCancel={() => navigate(detailPath)}
      />
    </>
  )
}
