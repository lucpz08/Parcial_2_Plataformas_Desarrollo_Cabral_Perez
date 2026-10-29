import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Check, CheckCheck, MessageSquareOff, ShieldAlert } from 'lucide-react'
import { ReviewModal } from '@/components/reviews/ReviewModal/ReviewModal'
import { ReviewPrompt } from '@/components/reviews/ReviewPrompt/ReviewPrompt'
import { Alert, Avatar, Badge, Button, EmptyState, StarRating } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { chatsService } from '@/services/chats'
import { feedbackService } from '@/services/feedback'
import { cx } from '@/utils/cx'
import { formatTime } from '@/utils/format'
import { groupMessagesByDay } from './chatUtils'
import { ListingContext } from './ListingContext'
import { MessageComposer } from './MessageComposer'
import styles from './ChatsPage.module.css'

export function ChatThread({ conversationId, user }) {
  const toast = useToast()
  const scrollRef = useRef(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const conversation = chatsService.getDetailedForUser(conversationId, user.id)
  const messages = conversation ? chatsService.getMessages(conversationId) : []
  const unread = messages.filter((message) => message.senderId !== user.id && !message.readAt).length

  useEffect(() => {
    if (unread > 0) chatsService.markAsRead(conversationId, user.id)
  }, [conversationId, user.id, unread])

  useEffect(() => {
    const container = scrollRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [messages.length])

  if (!conversation || !conversation.peer) {
    return (
      <EmptyState
        icon={MessageSquareOff}
        title="No encontramos esta conversación"
        description="Puede que no exista o que no participes de ella."
        action={
          <Button as={Link} to="/chats" variant="outline">
            Volver a mis chats
          </Button>
        }
      />
    )
  }

  const { peer, listing } = conversation
  const peerSuspended = peer.status !== 'activo'
  const reviewContext = conversation.claimId ? feedbackService.getForClaim(conversation.claimId, user.id) : null

  function handleSend(text) {
    try {
      chatsService.send(conversationId, user.id, text)
      return true
    } catch (error) {
      toast.error('No se pudo enviar', error.message)
      return false
    }
  }

  return (
    <>
      <header className={styles.threadHeader}>
        <Link to="/chats" className={styles.threadBack} aria-label="Volver a la lista de chats">
          <ArrowLeft size={20} />
        </Link>
        <Avatar name={peer.displayName} src={peer.avatarUrl} size={42} />
        <div className={styles.threadPeer}>
          <Link to={`/usuarios/${peer.id}`}>{peer.displayName}</Link>
          <span>
            <StarRating value={peer.rating.average} size={11} />
            @{peer.username}
            {peer.province && ` · ${peer.province}`}
          </span>
        </div>
        {peerSuspended && (
          <Badge tone="danger" icon={ShieldAlert}>
            Suspendida
          </Badge>
        )}
      </header>

      <ListingContext listing={listing} userId={user.id} />
      {reviewContext && !reviewContext.myReview && (
        <ReviewPrompt context={reviewContext} onReview={() => setReviewOpen(true)} compact />
      )}
      <ReviewModal
        context={reviewOpen && reviewContext && !reviewContext.myReview ? reviewContext : null}
        userId={user.id}
        onClose={() => setReviewOpen(false)}
      />

      <div className={styles.messages} ref={scrollRef} aria-live="polite">
        {messages.length === 0 && (
          <p className={styles.threadEmpty}>
            Este es el comienzo de tu conversación con {peer.displayName}. Saludá y coordiná los detalles.
          </p>
        )}
        {groupMessagesByDay(messages).map((day) => (
          <section key={day.key} className={styles.day} aria-label={day.label}>
            <span className={styles.dayLabel}>{day.label}</span>
            {day.messages.map((message) => {
              const mine = message.senderId === user.id
              return (
                <div
                  key={message.id}
                  className={cx(styles.bubble, mine ? styles.mine : styles.theirs, message.isLastInGroup && styles.lastInGroup)}
                >
                  <p>{message.body}</p>
                  <span className={styles.bubbleMeta}>
                    {formatTime(message.createdAt)}
                    {mine &&
                      (message.readAt ? (
                        <CheckCheck size={14} className={styles.read} aria-label="Leído" />
                      ) : (
                        <Check size={14} aria-label="Enviado" />
                      ))}
                  </span>
                </div>
              )
            })}
          </section>
        ))}
      </div>

      {peerSuspended && (
        <Alert tone="warning" className={styles.threadAlert}>
          Esta cuenta fue suspendida por moderación. No podés enviarle mensajes.
        </Alert>
      )}
      <MessageComposer
        key={conversationId}
        onSend={handleSend}
        disabled={peerSuspended}
        showQuickReplies={Boolean(listing) && !messages.some((message) => message.senderId === user.id)}
      />
    </>
  )
}
