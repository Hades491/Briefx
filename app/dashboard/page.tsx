'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { LearningAnalytics } from '@/components/learning-analytics'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MessageCircle, BookOpen, Clock, TrendingUp, Plus } from 'lucide-react'

interface UserStats {
  total_conversations: number
  total_messages: number
  total_learning_time: number
}

interface Conversation {
  id: string
  title: string
  created_at: string
  message_count?: number
}

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<UserStats>({
    total_conversations: 0,
    total_messages: 0,
    total_learning_time: 0,
  })
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Load user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('total_conversations, total_messages, total_learning_time')
        .eq('user_id', user.id)
        .single()

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error loading stats:', statsError)
      } else if (statsData) {
        setStats(statsData)
      }

      // Load recent conversations
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (convError) {
        console.error('Error loading conversations:', convError)
      } else {
        setRecentConversations(convData || [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Briefix</h1>
          <p className="text-muted-foreground text-lg">
            Your AI-powered learning companion. Get answers, learn faster, and track your progress.
          </p>
          <Button onClick={startNewChat} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Start New Chat
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Conversations
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_conversations}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Learning sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Messages
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_messages}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Questions & answers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Learning Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_learning_time}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.min(100, Math.floor(stats.total_messages / 2))}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Keep learning
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LearningAnalytics />
          </div>
        </div>

        {/* Recent Conversations */}
        {recentConversations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recent Chats</h2>
            <div className="grid gap-4">
              {recentConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    router.push(`/dashboard/chat/${conversation.id}`)
                  }
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{conversation.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(conversation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
