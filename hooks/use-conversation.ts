import { useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

interface UseConversationOptions {
  conversationId: string
  onMessageSent?: () => void
}

export function useConversation({
  conversationId,
  onMessageSent,
}: UseConversationOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return

      setError(null)
      setIsLoading(true)

      try {
        // Send to API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId,
            message: userMessage,
            conversationHistory: messages,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to get response')
        }

        const data = await response.json()

        // Add messages to local state
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: userMessage, timestamp: Date.now() },
          {
            role: 'assistant',
            content: data.response.content,
            timestamp: data.response.timestamp,
          },
        ])

        if (onMessageSent) {
          onMessageSent()
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        console.error('[useConversation] Error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [conversationId, messages]
  )

  const loadMessages = useCallback(async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('messages')
        .select('role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (queryError) {
        throw queryError
      }

      const formattedMessages: Message[] = (data || []).map(
        (msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at).getTime(),
        })
      )

      setMessages(formattedMessages)
    } catch (err) {
      console.error('[useConversation] Error loading messages:', err)
      setError('Failed to load messages')
    }
  }, [conversationId])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadMessages,
    clearError,
  }
}
