import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'

interface QuizBubbleProps {
  question: string
  options: string[]
  onAnswer: (answer: string) => void
}

export function QuizBubble({ question, options, onAnswer }: QuizBubbleProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (selectedAnswer) {
      setSubmitted(true)
      setTimeout(() => {
        onAnswer(selectedAnswer)
      }, 1500)
    }
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-4">
      <div>
        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          📝 {question}
        </p>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index}>
            <button
              onClick={() => !submitted && setSelectedAnswer(option)}
              disabled={submitted}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedAnswer === option
                  ? 'border-blue-500 bg-blue-100 dark:bg-blue-900'
                  : 'border-blue-200 dark:border-blue-800 hover:border-blue-400'
              } ${submitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-blue-300'
                  }`}
                >
                  {selectedAnswer === option && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {option}
                </span>
              </div>
            </button>
          </div>
        ))}
      </div>

      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full"
          variant="default"
        >
          Submit Answer
        </Button>
      )}

      {submitted && (
        <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-950 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300">
            Great! Let's continue learning...
          </span>
        </div>
      )}
    </div>
  )
}
