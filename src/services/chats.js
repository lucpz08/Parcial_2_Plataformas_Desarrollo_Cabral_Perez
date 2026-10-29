import { createRepository } from './repository'
import { usersService } from './users'
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
          lastMessage: thread.at(-1) ?? null,
          unreadCount: thread.filter((message) => message.senderId !== userId && !message.readAt).length,
        }
      })
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
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
    const existing = chatsService.findBetween(userId, peerId, listingId)
    if (existing) {
      return claimId && existing.claimId !== claimId ? conversations.update(existing.id, { claimId }) : existing
    }
    const timestamp = now()
    return conversations.create({ participants: [userId, peerId], listingId, claimId, lastMessageAt: timestamp })
  },

  send(conversationId, senderId, body) {
    const text = body.trim()
    if (!text) throw new Error('El mensaje no puede estar vacío.')
    const message = messages.create({ conversationId, senderId, body: text, readAt: null })
    conversations.update(conversationId, { lastMessageAt: message.createdAt })
    return message
  },
}
