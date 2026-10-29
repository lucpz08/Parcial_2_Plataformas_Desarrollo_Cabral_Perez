import { createRepository } from './repository'
import { usersService } from './users'

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
}
