import { useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { Avatar, Input, Modal, StarRating } from '@/components/ui'
import { chatsService } from '@/services/chats'
import styles from './ChatsPage.module.css'

export function NewChatModal({ open, onClose, userId, onSelect }) {
  const [query, setQuery] = useState('')
  const contacts = open ? chatsService.getContacts(userId, query) : []

  function handleClose() {
    setQuery('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Nuevo chat" description="Escribile a otro coleccionista de Riolup.">
      <div className={styles.contacts}>
        <Input
          icon={Search}
          type="search"
          placeholder="Buscar por nombre o usuario..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Buscar coleccionista"
        />
        {contacts.length === 0 ? (
          <p className={styles.listEmpty}>No encontramos coleccionistas con ese nombre.</p>
        ) : (
          <ul className={styles.contactList}>
            {contacts.map((contact) => (
              <li key={contact.id}>
                <button
                  type="button"
                  className={styles.contact}
                  onClick={() => {
                    setQuery('')
                    onSelect(contact)
                  }}
                >
                  <Avatar name={contact.displayName} src={contact.avatarUrl} size={40} />
                  <span className={styles.contactText}>
                    <strong>{contact.displayName}</strong>
                    <span>@{contact.username}</span>
                  </span>
                  <span className={styles.contactMeta}>
                    <StarRating value={contact.rating.average} size={11} />
                    {contact.province && (
                      <span>
                        <MapPin size={12} />
                        {contact.province}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}
