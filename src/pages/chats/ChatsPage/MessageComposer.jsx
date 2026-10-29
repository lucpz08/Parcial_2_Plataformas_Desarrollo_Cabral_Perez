import { useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import { MESSAGE_MAX_LENGTH } from '@/data/constants'
import { cx } from '@/utils/cx'
import { QUICK_REPLIES } from './chatUtils'
import styles from './ChatsPage.module.css'

export function MessageComposer({ onSend, showQuickReplies, disabled }) {
  const [draft, setDraft] = useState('')
  const remaining = MESSAGE_MAX_LENGTH - draft.length
  const canSend = draft.trim().length > 0 && remaining >= 0 && !disabled

  function send(text) {
    if (onSend(text)) setDraft('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (canSend) send(draft)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) handleSubmit(event)
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      {showQuickReplies && !disabled && draft === '' && (
        <div className={styles.quickReplies}>
          {QUICK_REPLIES.map((reply) => (
            <button key={reply} type="button" className={styles.quickReply} onClick={() => send(reply)}>
              {reply}
            </button>
          ))}
        </div>
      )}
      <div className={styles.composerRow}>
        <textarea
          className={styles.composerInput}
          rows={1}
          placeholder={disabled ? 'No podés responder en esta conversación' : 'Escribí un mensaje...'}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label="Mensaje"
        />
        <button type="submit" className={styles.sendButton} disabled={!canSend} aria-label="Enviar mensaje">
          <SendHorizontal size={20} />
        </button>
      </div>
      <div className={styles.composerHint}>
        <span>Enter para enviar · Shift + Enter para un salto de línea</span>
        {remaining < 100 && <span className={cx(remaining < 0 && styles.overLimit)}>{remaining}</span>}
      </div>
    </form>
  )
}
