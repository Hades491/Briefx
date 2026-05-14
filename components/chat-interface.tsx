'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Send, AlertCircle, Copy, Check, Image as ImageIcon } from 'lucide-react'
import { MarkdownContent } from '@/components/markdown-content'
import { QuizBubble } from '@/components/quiz-bubble'
import { filterContent } from '@/lib/ai/briefix-ai'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
  imageUrl?: string
  type?: 'text' | 'quiz'
  quizQuestion?: string
  quizOptions?: string[]
}

interface ChatInterfaceProps {
  conversationId: string
  initialMessages?: Message[]
  onSendMessage?: (message: string) => void
}

export function ChatInterface({
  conversationId,
  initialMessages = [],
  onSendMessage,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() && !imagePreview) return

    const userMessage = inputValue.trim()

    // Filter content for appropriateness
    const contentCheck = filterContent(userMessage)
    if (!contentCheck.allowed) {
      setError(contentCheck.reason || 'Please ask a study-related question')
      return
    }

    setInputValue('')
    setImagePreview(null)

    // Add user message to UI
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
      type: 'text',
    }
    setMessages((prev) => [...prev, newUserMessage])

    // Call the callback if provided
    if (onSendMessage) {
      onSendMessage(userMessage)
    }

    setIsLoading(true)

    try {
      // Send message to API
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
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response.content,
        timestamp: data.response.timestamp,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)

      console.error('[Chat] Error:', err)

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I encountered an error: ${errorMessage}. Please try again.`,
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsLoading(false)
      // Focus input for next message
      inputRef.current?.focus()
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  const clearImagePreview = () => {
    setImagePreview(null)
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-md">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Start Learning with Briefix
              </h3>
              <p className="text-sm text-muted-foreground">
                Ask any question about your studies. I&apos;m here to help you
                understand concepts, prepare for exams, and excel in your
                academics.
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xl rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted text-foreground rounded-bl-none border border-border'
              }`}
            >
              {message.imageUrl && (
                <div className="mb-2">
                  <img
                    src={message.imageUrl}
                    alt="Uploaded"
                    className="max-h-48 rounded-t-lg"
                  />
                </div>
              )}
              <div className="px-4 py-3">
                {message.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                ) : message.type === 'quiz' && message.quizQuestion && message.quizOptions ? (
                  <QuizBubble
                    question={message.quizQuestion}
                    options={message.quizOptions}
                    onAnswer={(answer) => {
                      const quizAnswer: Message = {
                        role: 'user',
                        content: `My answer: ${answer}`,
                        timestamp: Date.now(),
                        type: 'text',
                      }
                      setMessages((prev) => [...prev, quizAnswer])
                    }}
                  />
                ) : (
                  <MarkdownContent content={message.content} />
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg rounded-bl-none px-4 py-3 border border-border">
              <div className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 border border-destructive/20 max-w-xs lg:max-w-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 space-y-2">
        {imagePreview && (
          <div className="flex items-center gap-2 bg-muted p-2 rounded-lg">
            <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded" />
            <div className="flex-1 text-sm text-muted-foreground">Image ready to analyze</div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearImagePreview}
            >
              Remove
            </Button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about your studies..."
            disabled={isLoading}
            className="flex-1"
            autoFocus
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => imageInputRef.current?.click()}
            disabled={isLoading}
            title="Upload image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            disabled={isLoading || (!inputValue.trim() && !imagePreview)}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
