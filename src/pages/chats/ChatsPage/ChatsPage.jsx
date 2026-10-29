import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { MessageSquarePlus, MessagesSquare } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { chatsService } from '@/services/chats'
import { cx } from '@/utils/cx'
import { ChatThread } from './ChatThread'
import { ConversationList } from './ConversationList'
import { NewChatModal } from './NewChatModal'
import styles from './ChatsPage.module.css'

export function ChatsPage() {
  useDatabase()
  const { conversationId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [newChatOpen, setNewChatOpen] = useState(false)

  const conversations = chatsService.getForUser(user.id)
  const active = conversations.find((conversation) => conversation.id === conversationId)
  const unreadTotal = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0)
  useDocumentTitle(active ? `Chat con ${active.peer.displayName}` : unreadTotal > 0 ? `(${unreadTotal}) Chats` : 'Chats')

  function startChat(peer) {
    try {
      const conversation = chatsService.getOrCreate({ userId: user.id, peerId: peer.id })
      setNewChatOpen(false)
      navigate(`/chats/${conversation.id}`)
    } catch (error) {
      toast.error('No se pudo iniciar el chat', error.message)
    }
  }

  return (
    <div className={cx(styles.page, conversationId && styles.hasThread)}>
      <ConversationList conversations={conversations} userId={user.id} onNewChat={() => setNewChatOpen(true)} />

      <section className={styles.thread}>
        {conversationId ? (
          <ChatThread key={conversationId} conversationId={conversationId} user={user} />
        ) : (
          <EmptyState
            icon={MessagesSquare}
            title="Elegí una conversación"
            description="Coordiná pagos, envíos e intercambios con otros coleccionistas sin salir de Riolup."
            action={
              <Button variant="outline" icon={MessageSquarePlus} onClick={() => setNewChatOpen(true)}>
                Nuevo chat
              </Button>
            }
          />
        )}
      </section>

      <NewChatModal open={newChatOpen} onClose={() => setNewChatOpen(false)} userId={user.id} onSelect={startChat} />
    </div>
  )
}
