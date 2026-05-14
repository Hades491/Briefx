import { createClient } from '@/lib/supabase/server'
import { getAIService } from '@/lib/ai/service'
import { generateBriefixResponse, filterContent } from '@/lib/ai/briefix-ai'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Chat API Route
 * 
 * Handles incoming chat messages, processes them through Briefix AI,
 * stores the conversation in Supabase, and returns the response with quiz support.
 */

interface ChatRequestBody {
  conversationId: string
  message: string
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: ChatRequestBody = await request.json()
    const { conversationId, message, conversationHistory = [] } = body

    if (!message || !conversationId) {
      return NextResponse.json(
        { error: 'Message and conversationId are required' },
        { status: 400 }
      )
    }

    // Verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Store the user's message
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: 'user',
        content: message,
      })

    if (userMessageError) {
      console.error('Error storing user message:', userMessageError)
      return NextResponse.json(
        { error: 'Failed to store message' },
        { status: 500 }
      )
    }

    // Filter message for educational appropriateness
    const contentCheck = filterContent(message)
    if (!contentCheck.allowed) {
      return NextResponse.json(
        { error: contentCheck.reason || 'Please ask a study-related question' },
        { status: 400 }
      )
    }

    // Get user profile for teaching mode
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_teaching_mode')
      .eq('id', user.id)
      .single()

    const teachingMode = profile?.preferred_teaching_mode || 'general'

    // Generate response using Briefix AI
    const aiResponse = await generateBriefixResponse(message, {
      subject: undefined,
      topic: undefined,
      messages: conversationHistory,
    }, teachingMode)

    // Store the AI response
    const { error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: 'assistant',
        content: aiResponse.content,
      })

    if (aiMessageError) {
      console.error('Error storing AI message:', aiMessageError)
      // Don't return error to user - the AI response was generated successfully
      // The message will be fetched from conversation history on the client
    }

    // Update conversation's last updated timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    // Update user stats and track learning metrics
    const { data: stats } = await supabase
      .from('user_stats')
      .select('total_conversations, total_messages')
      .eq('user_id', user.id)
      .single()

    if (stats) {
      await supabase
        .from('user_stats')
        .update({
          total_messages: (stats.total_messages || 0) + 2, // User message + AI response
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    // Update subject proficiency if available
    const { data: profileData } = await supabase
      .from('profiles')
      .select('learning_categories')
      .eq('id', user.id)
      .single()

    if (profileData?.learning_categories && profileData.learning_categories.length > 0) {
      // Assume first category or infer from message - simplified for now
      const primarySubject = profileData.learning_categories[0] as string
      
      const { data: proficiency } = await supabase
        .from('subject_proficiency')
        .select('proficiency_level, practice_count')
        .eq('user_id', user.id)
        .eq('subject', primarySubject)
        .single()

      if (proficiency) {
        // Slightly increment proficiency on each interaction
        const newProficiency = Math.min(100, proficiency.proficiency_level + 1)
        await supabase
          .from('subject_proficiency')
          .update({
            proficiency_level: newProficiency,
            practice_count: (proficiency.practice_count || 0) + 1,
            last_practiced: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('subject', primarySubject)
      }
    }

    // Track study session
    const sessionDuration = 1 // 1 minute per message for now
    await supabase.from('learning_sessions').insert({
      user_id: user.id,
      conversation_id: conversationId,
      started_at: new Date().toISOString(),
      ended_at: new Date(Date.now() + sessionDuration * 60000).toISOString(),
      duration_minutes: sessionDuration,
    })

    return NextResponse.json({
      success: true,
      response: aiResponse,
      model: 'Briefix AI',
    })
  } catch (error) {
    console.error('[Chat API] Error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS endpoint for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json({ ok: true })
}
