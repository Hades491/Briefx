'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Brain, BarChart3, Zap, BookOpen, Target } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Briefix</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
          Your Personal AI Tutor for Academic Excellence
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
          Master any subject with personalized learning paths. Get instant answers, ace your exams, and track your progress with Briefix AI.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2">
              <Sparkles className="w-5 h-5" />
              Get Started Free
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-center text-foreground mb-12">
          Why Choose Briefix?
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-border">
            <CardHeader>
              <Brain className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Intelligent Learning</CardTitle>
              <CardDescription>
                AI-powered responses tailored to your learning style
              </CardDescription>
            </CardHeader>
            <CardContent>
              Get instant explanations, solve complex problems, and understand concepts at your own pace.
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <Target className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Exam Focused</CardTitle>
              <CardDescription>
                Ace JEE, NEET, UPSC and competitive exams
              </CardDescription>
            </CardHeader>
            <CardContent>
              Specialized tutoring for competitive exam preparation with topic-wise guidance.
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Visualize your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              Track study hours, monitor progress, and identify weak areas with detailed analytics.
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <Zap className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Instant Responses</CardTitle>
              <CardDescription>
                Get answers in seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              No waiting for replies. Get instant AI responses to all your academic questions.
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <BookOpen className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Multi-Subject Support</CardTitle>
              <CardDescription>
                Cover all your subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              Mathematics, Physics, Chemistry, Biology, and more. Learn any subject with expert guidance.
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <Sparkles className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Always Improving</CardTitle>
              <CardDescription>
                Continuously updated AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              Our AI learns and improves with every interaction to serve you better.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Excel in Your Studies?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of students using Briefix to ace their exams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/sign-up">
              <Button size="lg">Start Learning Now</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2024 Briefix. All rights reserved. Made with ❤️ for students.</p>
        </div>
      </footer>
    </div>
  )
}
