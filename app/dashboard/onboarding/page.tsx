'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { BookOpen, Target, Zap } from 'lucide-react'

const TEACHING_MODES = [
  { id: 'general', name: 'General Learning', description: 'Balanced learning approach' },
  { id: 'exam-prep', name: 'Exam Preparation', description: 'Focused on exam strategies' },
  { id: 'deep-dive', name: 'Deep Dive', description: 'Comprehensive topic exploration' },
  { id: 'quick-learn', name: 'Quick Learn', description: 'Fast paced learning' },
]

const LEARNING_CATEGORIES = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Economics',
  'Programming',
  'Data Science',
  'Competitive Exams',
  'STEM',
]

const LEARNING_GOALS = [
  'Improve grades',
  'Prepare for exams',
  'Learn new topics',
  'Deepen understanding',
  'Practice problem-solving',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [age, setAge] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [teachingMode, setTeachingMode] = useState('general')
  const [error, setError] = useState<string | null>(null)

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal]
    )
  }

  const handleComplete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          age: parseInt(age),
          class: studentClass,
          learning_categories: selectedCategories,
          learning_goals: selectedGoals,
          preferred_teaching_mode: teachingMode,
        })
        .eq('id', user.id)

      if (error) throw error

      // Initialize subject proficiency for selected categories
      const proficiencies = selectedCategories.map((category) => ({
        user_id: user.id,
        subject: category,
        proficiency_level: 50,
        practice_count: 0,
      }))

      if (proficiencies.length > 0) {
        await supabase.from('subject_proficiency').insert(proficiencies)
      }

      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error completing onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to Briefix AI</CardTitle>
          <CardDescription>
            Step {step} of 4 - Let us personalize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Age & Class */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">Your Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="e.g., 16"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="10"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class/Grade</Label>
                  <Input
                    id="class"
                    type="text"
                    placeholder="e.g., 10th Grade"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!age || !studentClass}
                className="w-full"
              >
                Next: Learning Categories
              </Button>
            </div>
          )}

          {/* Step 2: Learning Categories */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">
                  What subjects interest you? (Select at least 2)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {LEARNING_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedCategories.includes(category)
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-medium">{category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={selectedCategories.length < 2}
                  className="flex-1"
                >
                  Next: Learning Goals
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Learning Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">
                  What are your learning goals? (Select at least 1)
                </Label>
                <div className="grid gap-3">
                  {LEARNING_GOALS.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => handleGoalToggle(goal)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedGoals.includes(goal)
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span className="font-medium">{goal}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={selectedGoals.length === 0}
                  className="flex-1"
                >
                  Next: Teaching Mode
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Teaching Mode */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">
                  How would you like to learn?
                </Label>
                <div className="grid gap-3">
                  {TEACHING_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setTeachingMode(mode.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        teachingMode === mode.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">{mode.name}</div>
                          <div className="text-sm text-muted-foreground">{mode.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Setting up...
                    </>
                  ) : (
                    'Start Learning'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
