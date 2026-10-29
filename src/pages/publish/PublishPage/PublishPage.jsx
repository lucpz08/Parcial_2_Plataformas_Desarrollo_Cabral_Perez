import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { CollectionMode, EditMode, WantedMode } from './PublishModes'
import { PublishSuccess } from './PublishSuccess'
import { SourcePicker } from './SourcePicker'
import styles from './PublishPage.module.css'

export function PublishPage() {
  useDatabase()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [publishedIds, setPublishedIds] = useState(null)

  const editId = searchParams.get('editar')
  const wantedCardId = searchParams.get('busco')
  const itemIds = (searchParams.get('items') ?? '').split(',').filter(Boolean)

  function startOver() {
    setPublishedIds(null)
    setSearchParams({})
  }

  function handlePublished(listings) {
    setPublishedIds(listings.map((listing) => listing.id))
  }

  function renderContent() {
    if (publishedIds) return <PublishSuccess listingIds={publishedIds} onPublishMore={startOver} />
    if (editId) return <EditMode listingId={editId} user={user} />
    if (wantedCardId) return <WantedMode cardId={wantedCardId} user={user} onPublished={handlePublished} onBack={startOver} />
    if (itemIds.length > 0) {
      return <CollectionMode itemIds={itemIds} user={user} onPublished={handlePublished} onBack={startOver} />
    }
    return (
      <SourcePicker
        user={user}
        onSelectItems={(ids) => setSearchParams({ items: ids.join(',') })}
        onSelectCard={(cardId) => setSearchParams({ busco: cardId })}
      />
    )
  }

  return <div className={styles.page}>{renderContent()}</div>
}
