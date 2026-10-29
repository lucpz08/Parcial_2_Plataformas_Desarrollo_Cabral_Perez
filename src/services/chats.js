import { createRepository } from './repository'
import { listingsService } from './listings'
import { getTable, setTable } from './storage'
import { usersService } from './users'
import { MESSAGE_MAX_LENGTH } from '@/data/constants'
import { now } from '@/utils/id'

const conversations = createRepository('conversations', 'cv')
const messages = createRepository('messages', 'm')

export const chatsService = {
  conversations,
  messages,

  getForUser(userId) {
    return conversations
      .where((conversation) => conversation.participants.includes(userId))
      .map((conversation) => {
        const peerId = conversation.participants.find((id) => id !== userId)
        const thread = chatsService.getMessages(conversation.id)
        return {
          ...conversation,
          peer: usersService.toPublic(usersService.findById(peerId)),
          listing: conversation.listingId ? listingsService.getDetailed(conversation.listingId) : null,
          lastMessage: thread.at(-1) ?? null,
          unreadCount: thread.filter((message) => message.senderId !== userId && !message.readAt).length,
        }
      })
      .filter((conversation) => conversation.peer)
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
  },

  getDetailedForUser(conversationId, userId) {
    const conversation = conversations.findById(conversationId)
    if (!conversation || !conversation.participants.includes(userId)) return null
    const peerId = conversation.participants.find((id) => id !== userId)
    return {
      ...conversation,
      peer: usersService.toPublic(usersService.findById(peerId)),
      listing: conversation.listingId ? listingsService.getDetailed(conversation.listingId) : null,
    }
  },

  markAsRead(conversationId, userId) {
    const timestamp = now()
    let changed = 0
    const rows = getTable('messages').map((message) => {
      if (message.conversationId !== conversationId || message.senderId === userId || message.readAt) return message
      changed += 1
      return { ...message, readAt: timestamp }
    })
    if (changed > 0) setTable('messages', rows)
    return changed
  },

  getContacts(userId, query = '') {
    const text = query.trim().toLowerCase()
    return usersService
      .where(
        (user) =>
          user.id !== userId &&
          user.status === 'activo' &&
          (!text || user.displayName.toLowerCase().includes(text) || user.username.toLowerCase().includes(text)),
      )
      .map(usersService.toPublic)
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
  },

  getMessages(conversationId) {
    return messages
      .where((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  },

  getUnreadCount(userId) {
    return chatsService.getForUser(userId).reduce((sum, conversation) => sum + conversation.unreadCount, 0)
  },

  findBetween(userId, peerId, listingId = null) {
    return (
      conversations
        .all()
        .find(
          (conversation) =>
            conversation.participants.includes(userId) &&
            conversation.participants.includes(peerId) &&
            conversation.listingId === listingId,
        ) ?? null
    )
  },

  getOrCreate({ userId, peerId, listingId = null, claimId = null }) {
    if (userId === peerId) throw new Error('No podés iniciar un chat con vos mismo.')
    const existing = chatsService.findBetween(userId, peerId, listingId)
    if (existing) {
      return claimId && existing.claimId !== claimId ? conversations.update(existing.id, { claimId }) : existing
    }
    if (usersService.findById(peerId)?.status !== 'activo') throw new Error('Esa cuenta no está disponible para chatear.')
    const timestamp = now()
    return conversations.create({ participants: [userId, peerId], listingId, claimId, lastMessageAt: timestamp })
  },

  send(conversationId, senderId, body) {
    const text = body.trim()
    if (!text) throw new Error('El mensaje no puede estar vacío.')
    if (text.length > MESSAGE_MAX_LENGTH) throw new Error(`El mensaje admite hasta ${MESSAGE_MAX_LENGTH} caracteres.`)
    const conversation = conversations.findById(conversationId)
    if (!conversation || !conversation.participants.includes(senderId)) throw new Error('No participás de esta conversación.')
    const peer = usersService.findById(conversation.participants.find((id) => id !== senderId))
    if (peer?.status !== 'activo') throw new Error('No podés escribirle a una cuenta suspendida.')
    const message = messages.create({ conversationId, senderId, body: text, readAt: null })
    conversations.update(conversationId, { lastMessageAt: message.createdAt })
    return message
  },
}
