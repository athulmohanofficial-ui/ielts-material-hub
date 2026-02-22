'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { evaluateWriting } from '@/lib/gemini'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Clock, 
  Loader2, 
  Send, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  RotateCcw,
  Download
} from 'lucide-react'

export default function WritingTaskPage({ params }: { params: { taskId: string } }) {
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Essay state
  const [essay, setEssay] = useState('')
  const [wordCount, setWordCount] = useState(0)
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  
  // AI feedback state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch task
  useEffect(() => {
    async function fetchTask() {
      const { data, error } = await supabase
        .from('writing_tasks')
        .select('*')
        .eq('id', params.taskId)
        .single()
      
      if (data) {
        setTask(data)
        // Set timer: 20 min for Task 1, 40 min for Task 2
        setTimeLeft(data.task_type === 1 ? 20 * 60 : 40 * 60)
      }
      setLoading(false)
    }
    
    fetchTask()
  }, [params.taskId])

  // Word count
  useEffect(() => {
    const words = essay.trim().split(/\s+/).filter(w => w.length > 0).length
    setWordCount(words)
  }, [essay])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [isTimerRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => setIsTimerRunning(true)
  const pauseTimer = () => setIsTimerRunning(false)
  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimeLeft(task?.task_type === 1 ? 20 * 60 : 40 * 60)
  }

  const submitEssay = async () => {
    if (!essay.trim() || !task) return
    
    const minWords = task.task_type === 1 ? 150 : 250
    if (wordCount < minWords) {
      setError(`Your essay is too short. Minimum ${minWords} words required.`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Get AI feedback
      const aiFeedback = await evaluateWriting(essay, task.question_text, task.task_type === 1)

      // Upload essay as text file
      const fileName = `essay-${Date.now()}.txt`
      const blob = new Blob([essay], { type: 'text/plain' })
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('writing-essays')
        .upload(fileName, blob)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('writing-essays')
        .getPublicUrl(fileName)

      // Save to database
      await supabase.from('writing_submissions').insert({
        task_id: task.id,
        essay_url: publicUrl,
        essay_text: essay,
        word_count: wordCount,
        ai_feedback: aiFeedback,
        band_score: aiFeedback.overallBand
      })

      setFeedback(aiFeedback)
      setIsTimerRunning(false)

    } catch (err: any) {
      setError(err.message || 'Failed to get AI feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-writing-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (!task) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Task not found</h1>
          <Link href="/writing" className="text-writing-600 mt-4 inline-block">
            ← Back to Writing
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href={`/writing/${task.category}`} className="mr-4 text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  {task.category === 'academic' ? 'Academic' : 'General'} Writing - Task {task.task_type}
                </h1>
                <p className="text-sm text-gray-500">
                  {task.task_type === 1 ? '20 minutes • 150 words minimum' : '40 minutes • 250 words minimum'}
                </p>
              </div>
            </div>
            
            {/* Timer Display */}
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-mono font-bold ${
                timeLeft < 60 ? 'text-red-600' : 'text-writing-600'
              }`}>
                <Clock className="w-5 h-5 inline mr-2" />
                {formatTime(timeLeft)}
              </div>
              <div className="flex gap-2">
                {!isTimerRunning ? (
                  <button 
                    onClick={startTimer}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Start
                  </button>
                ) : (
                  <button 
                    onClick={pauseTimer}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700"
                  >
                    Pause
                  </button>
                )}
                <button 
                  onClick={resetTimer}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Question */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-writing-600" />
              Task Question
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">{task.question_text}</p>
            
            {task.image_url && (
              <div className="mt-4">
                <img 
                  src={task.image_url} 
                  alt="Task diagram" 
                  className="rounded-lg border w-full"
                />
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Tips:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Plan before you write</li>
                <li>• Use paragraphs clearly</li>
                <li>• Check grammar & spelling</li>
                <li>• Meet the word count</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-2">
          {!feedback ? (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Toolbar */}
              <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Essay Editor</span>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${
                    wordCount >= (task.task_type === 1 ? 150 : 250) 
                      ? 'text-green-600' 
                      : 'text-gray-600'
                  }`}>
                    Words: {wordCount} / {task.task_type === 1 ? '150+' : '250+'}
                  </span>
                </div>
              </div>

              {/* Text Area */}
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Start typing your essay here..."
                className="w-full h-96 p-6 resize-none focus:outline-none text-gray-800 leading-relaxed"
                disabled={isSubmitting}
              />

              {/* Bottom Bar */}
              <div className="border-t p-4 flex items-center justify-between bg-gray-50">
                <button
                  onClick={() => setEssay('')}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Clear
                </button>
                
                <button
                  onClick={submitEssay}
                  disabled={isSubmitting || wordCount < (task.task_type === 1 ? 150 : 250)}
                  className="bg-writing-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-writing-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit for Feedback
                    </>
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border-t border-red-200 p-4 flex items-center gap-3 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          ) : (
            /* AI Feedback Results */
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-writing-600 text-white rounded-xl p-6 text-center">
                <h3 className="text-lg font-medium mb-2">Your Band Score</h3>
                <div className="text-6xl font-bold">{feedback.overallBand}</div>
                <p className="text-writing-100 mt-2">out of 9</p>
              </div>

              {/* Criteria Scores */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Scores</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Task Response</p>
                    <p className="text-2xl font-bold text-blue-800">{feedback.taskResponse}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-medium">Coherence & Cohesion</p>
                    <p className="text-2xl font-bold text-purple-800">{feedback.coherence}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Lexical Resource</p>
                    <p className="text-2xl font-bold text-green-800">{feedback.lexical}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-600 font-medium">Grammatical Range</p>
                    <p className="text-2xl font-bold text-orange-800">{feedback.grammar}</p>
                  </div>
                </div>
              </div>

              {/* Grammar Corrections */}
              {feedback.corrections && feedback.corrections.length > 0 && (
                <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Grammar Corrections ({feedback.corrections.length})
                  </h3>
                  <div className="space-y-3">
                    {feedback.corrections.map((corr: any, i: number) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-red-100">
                        <p className="text-red-600 line-through">{corr.error}</p>
                        <p className="text-green-600 font-medium">{corr.correction}</p>
                        <p className="text-gray-600 text-sm mt-1">{corr.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocabulary Upgrades */}
              {feedback.vocabularyUpgrades && feedback.vocabularyUpgrades.length > 0 && (
                <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">
                    Vocabulary Suggestions
                  </h3>
                  <div className="space-y-2">
                    {feedback.vocabularyUpgrades.map((vocab: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <span className="text-gray-500 line-through">{vocab.original}</span>
                        <span className="text-purple-600">→</span>
                        <span className="font-semibold text-purple-800">{vocab.upgrade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improved Essay */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Improved Version</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {feedback.improvedEssay}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Improvement Tips
                </h3>
                <ul className="space-y-2">
                  {feedback.tips.map((tip: string, i: number) => (
                    <li key={i} className="text-green-700 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Try Again */}
              <div className="text-center pb-8">
                <button 
                  onClick={() => {
                    setFeedback(null)
                    setEssay('')
                    setWordCount(0)
                    setTimeLeft(task.task_type === 1 ? 20 * 60 : 40 * 60)
                  }}
                  className="bg-writing-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-writing-700 transition"
                >
                  Practice Another Task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
