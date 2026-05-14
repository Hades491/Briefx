'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Flame, TrendingUp, Target, Clock } from 'lucide-react'

interface SubjectProficiency {
  subject: string
  proficiency_level: number
  practice_count: number
}

interface UserStats {
  study_streak: number
  last_study_date: string | null
}

export function LearningAnalytics() {
  const [subjects, setSubjects] = useState<SubjectProficiency[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Load subject proficiency
      const { data: proficiencyData } = await supabase
        .from('subject_proficiency')
        .select('subject, proficiency_level, practice_count')
        .eq('user_id', user.id)
        .order('proficiency_level', { ascending: false })

      setSubjects(proficiencyData || [])

      // Load user stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('total_conversations, total_messages')
        .eq('user_id', user.id)
        .single()

      // Load profile for streaks
      const { data: profileData } = await supabase
        .from('profiles')
        .select('study_streak, last_study_date')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setStats({
          study_streak: profileData.study_streak || 0,
          last_study_date: profileData.last_study_date,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Study Streak Card */}
      {stats && (
        <Card>
          <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Study Streak
          </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.study_streak}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Days in a row
              {stats.last_study_date && (
                <span className="block">
                  Last studied: {new Date(stats.last_study_date).toLocaleDateString()}
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Subject Proficiency */}
      {subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Subject Proficiency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjects.map((subject) => (
              <div key={subject.subject}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{subject.subject}</span>
                  <span className="text-xs text-muted-foreground">
                    {subject.proficiency_level}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${subject.proficiency_level}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {subject.practice_count} practices
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Learning Goals Reminder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Today&apos;s Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keep your study streak going! Practice one of your weak subjects today.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
