'use client'

import { ChatInterface } from '@/components/chat-interface'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { useConversation } from '@/hooks/use-conversation'

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.id as string
  const { messages, isLoading, loadMessages } = useConversation({
    conversationId,
  })

  useEffect(() => {
    if (conversationId) {
      loadMessages()
    }
  }, [conversationId, loadMessages])

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <ChatInterface
      conversationId={conversationId}
      initialMessages={messages}
    />
  )
}
