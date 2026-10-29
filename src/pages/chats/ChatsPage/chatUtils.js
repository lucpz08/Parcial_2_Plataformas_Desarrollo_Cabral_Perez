import { formatDay } from '@/utils/format'

const GROUP_WINDOW_MS = 5 * 60 * 1000

export const QUICK_REPLIES = ['¿Sigue disponible?', '¿Hacés envíos?', '¿Me pasás más fotos?', '¿Aceptás cambios?']

export function groupMessagesByDay(messages) {
  const days = []
  messages.forEach((message, index) => {
    const label = formatDay(message.createdAt)
    if (days.at(-1)?.label !== label) days.push({ key: message.id, label, messages: [] })

    const next = messages[index + 1]
    const continues =
      next &&
      next.senderId === message.senderId &&
      new Date(next.createdAt) - new Date(message.createdAt) < GROUP_WINDOW_MS &&
      formatDay(next.createdAt) === label

    days.at(-1).messages.push({ ...message, isLastInGroup: !continues })
  })
  return days
}

export function filterConversations(conversations, { query, onlyUnread }) {
  const text = query.trim().toLowerCase()
  return conversations.filter(
    (conversation) =>
      (!onlyUnread || conversation.unreadCount > 0) &&
      (!text ||
        conversation.peer.displayName.toLowerCase().includes(text) ||
        conversation.peer.username.toLowerCase().includes(text) ||
        conversation.listing?.card?.name.toLowerCase().includes(text)),
  )
}
