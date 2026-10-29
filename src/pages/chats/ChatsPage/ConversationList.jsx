import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { Compass, MessageSquarePlus, Search } from 'lucide-react'
import { Avatar, Button, Input, Tabs } from '@/components/ui'
import { cx } from '@/utils/cx'
import { formatShortRelative } from '@/utils/format'
import { filterConversations } from './chatUtils'
import styles from './ChatsPage.module.css'

function ConversationItem({ conversation, userId }) {
  const { peer, listing, lastMessage, unreadCount } = conversation
  const preview = lastMessage
    ? `${lastMessage.senderId === userId ? 'Vos: ' : ''}${lastMessage.body}`
    : 'Todavía no hay mensajes'

  return (
    <li>
      <NavLink
        to={`/chats/${conversation.id}`}
        className={({ isActive }) => cx(styles.item, isActive && styles.itemActive, unreadCount > 0 && styles.itemUnread)}
      >
        <Avatar name={peer.displayName} src={peer.avatarUrl} size={44} />
        <div className={styles.itemBody}>
          <div className={styles.itemTop}>
            <strong>{peer.displayName}</strong>
            <time dateTime={conversation.lastMessageAt}>{formatShortRelative(conversation.lastMessageAt)}</time>
          </div>
          {listing?.card && <span className={styles.itemListing}>{listing.card.name}</span>}
          <div className={styles.itemBottom}>
            <span className={styles.itemPreview}>{preview}</span>
            {unreadCount > 0 && (
              <span className={styles.unread} aria-label={`${unreadCount} sin leer`}>
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </NavLink>
    </li>
  )
}

export function ConversationList({ conversations, userId, onNewChat }) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const unreadTotal = conversations.filter((conversation) => conversation.unreadCount > 0).length
  const visible = filterConversations(conversations, { query, onlyUnread: tab === 'unread' })

  return (
    <aside className={styles.list} aria-label="Conversaciones">
      <header className={styles.listHeader}>
        <h1>Chats</h1>
        <Button size="sm" icon={MessageSquarePlus} onClick={onNewChat}>
          Nuevo
        </Button>
      </header>

      <div className={styles.listFilters}>
        <Input
          icon={Search}
          type="search"
          placeholder="Buscar persona o carta..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Buscar conversaciones"
        />
        <Tabs
          tabs={[
            { value: 'all', label: 'Todos', count: conversations.length },
            { value: 'unread', label: 'No leídos', count: unreadTotal },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {conversations.length === 0 ? (
        <div className={styles.listEmpty}>
          <p>Todavía no tenés conversaciones. Reservá una carta o consultá a un vendedor para empezar.</p>
          <Button as={Link} to="/explorar" variant="outline" size="sm" icon={Compass}>
            Explorar publicaciones
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <p className={styles.listEmpty}>No hay conversaciones que coincidan.</p>
      ) : (
        <ul className={styles.items}>
          {visible.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} userId={userId} />
          ))}
        </ul>
      )}
    </aside>
  )
}
