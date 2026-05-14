'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, MessageCircle, BarChart3, LogOut, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  onLogout: () => void
}

interface Conversation {
  id: string
  title: string
  created_at: string
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState('Student')

  useEffect(() => {
    const loadConversations = async () => {
      const supabase = createClient()

      // Get user profile
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        if (profile?.full_name) {
          setUserName(profile.full_name)
        }

        // Load conversations
        const { data, error } = await supabase
          .from('conversations')
          .select('id, title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) {
          console.error('Error loading conversations:', error)
        } else {
          setConversations(data || [])
        }
      }

      setIsLoading(false)
    }

    loadConversations()
  }, [])

  const createNewConversation = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: 'New Conversation',
      })
      .select()

    if (error) {
      console.error('Error creating conversation:', error)
      return
    }

    if (data && data[0]) {
      router.push(`/dashboard/chat/${data[0].id}`)
      setConversations([data[0], ...conversations])
    }
  }

  const deleteConversation = async (conversationId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (error) {
      console.error('Error deleting conversation:', error)
      return
    }

    setConversations(conversations.filter((c) => c.id !== conversationId))
    if (pathname.includes(conversationId)) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex flex-col h-full p-4 bg-sidebar">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Briefix</h1>
        <p className="text-sm text-muted-foreground">AI Tutor</p>
      </div>

      {/* User info */}
      <div className="mb-8 p-3 bg-card rounded-lg border">
        <p className="text-sm font-medium">Welcome back!</p>
        <p className="text-xs text-muted-foreground mt-1">{userName}</p>
      </div>

      {/* New Conversation Button */}
      <Button
        onClick={createNewConversation}
        className="w-full mb-6 gap-2"
        variant="default"
      >
        <Plus className="w-4 h-4" />
        New Chat
      </Button>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          <Link href="/dashboard">
            <Button
              variant={pathname === '/dashboard' ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="truncate">Dashboard</span>
            </Button>
          </Link>

          <div className="mt-6">
            <p className="text-xs font-semibold text-muted-foreground mb-3 px-2">
              RECENT CHATS
            </p>
            {isLoading ? (
              <p className="text-xs text-muted-foreground px-2">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2">
                No conversations yet
              </p>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center gap-1 group"
                >
                  <Link href={`/dashboard/chat/${conversation.id}`} className="flex-1">
                    <Button
                      variant={
                        pathname === `/dashboard/chat/${conversation.id}`
                          ? 'secondary'
                          : 'ghost'
                      }
                      className="w-full justify-start text-sm truncate"
                    >
                      <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{conversation.title}</span>
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this conversation? This action cannot be undone.
                      </AlertDialogDescription>
                      <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteConversation(conversation.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        onClick={onLogout}
        className="w-full gap-2 mt-auto"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  )
}
