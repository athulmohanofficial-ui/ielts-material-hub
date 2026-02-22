'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { evaluateSpeaking } from '@/lib/gemini'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Mic, 
  Square, 
  Play, 
  Volume2,
  Clock,
  Loader2,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function SpeakingPracticePage({ params }: { params: { questionId: string } }) {
  const [question, setQuestion] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  // Timer states
  const [prepTime, setPrepTime] = useState(120) // 2 minutes prep
  const [isPrepRunning, setIsPrepRunning] = useState(false)
  
  // AI feedback states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const prepTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch question
  useEffect(() => {
    async function fetchQuestion() {
      const { data, error } = await supabase
        .from('speaking_questions')
        .select('*')
        .eq('id', params.questionId)
        .single()
      
      if (data) {
        setQuestion(data)
      }
      setLoading(false)
    }
    
    fetchQuestion()
  }, [params.questionId])

  // Text to speech
  const speakQuestion = () => {
    if ('speechSynthesis' in window && question) {
      const utterance = new SpeechSynthesisUtterance(question.question_text)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  // Prep timer
  const startPrep = () => {
    setIsPrepRunning(true)
    prepTimerRef.current = setInterval(() => {
      setPrepTime((prev) => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current!)
          setIsPrepRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopPrep = () => {
    if (prepTimerRef.current) {
      clearInterval(prepTimerRef.current)
      setIsPrepRunning(false)
    }
  }

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Recording timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      // Auto stop after 2 minutes for Part 2, or 1 minute for others
      const maxTime = question?.part === 2 ? 120 : 60
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording()
        }
      }, maxTime * 1000)

    } catch (err) {
      setError('Could not access microphone. Please allow microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  // Submit to AI
  const submitToAI = async () => {
    if (!audioBlob || !question) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Upload audio to Supabase
      const fileName = `recording-${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('speaking-recordings')
        .upload(fileName, audioBlob)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('speaking-recordings')
        .getPublicUrl(fileName)

      // For now, we'll simulate transcription (in production, use speech-to-text API)
      // Since we don't have speech-to-text, we'll send a placeholder for demo
      const mockTranscript = "This is a placeholder transcript. In production, integrate Google Speech-to-Text or similar service to convert the audio to text before sending to Gemini."

      // Get AI feedback
      const aiFeedback = await evaluateSpeaking(mockTranscript, question.question_text)

      // Save to database
      await supabase.from('speaking_recordings').insert({
        question_id: question.id,
        audio_url: publicUrl,
        transcript: mockTranscript,
        ai_feedback: aiFeedback,
        band_score: aiFeedback.overallBand
      })

      setFeedback(aiFeedback)

    } catch (err: any) {
      setError(err.message || 'Failed to get AI feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-speaking-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (!question) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Question not found</h1>
          <Link href="/speaking" className="text-speaking-600 mt-4 inline-block">
            ← Back to Speaking
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/speaking/${question.category}`} className="mr-4 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Speaking Practice</h1>
              <span className="text-sm text-gray-500">Part {question.part}</span>
            </div>
          </div>
          <button 
            onClick={speakQuestion}
            className="flex items-center gap-2 text-speaking-600 hover:bg-speaking-50 px-3 py-2 rounded-lg transition"
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-sm font-medium">Read Aloud</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.part === 1 ? 'bg-blue-100 text-blue-700' :
              question.part === 2 ? 'bg-purple-100 text-purple-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              Part {question.part}
            </span>
          </div>
          <h2 className="text-xl text-gray-800 leading-relaxed">{question.question_text}</h2>
          {question.cue_card && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-speaking-500">
              <p className="text-gray-700 whitespace-pre-line">{question.cue_card}</p>
            </div>
          )}
        </div>

        {/* Prep Timer */}
        {!isRecording && !audioUrl && !feedback && (
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Preparation Time</h3>
            <div className="text-5xl font-mono font-bold text-speaking-600 mb-6">
              {formatTime(prepTime)}
            </div>
            {!isPrepRunning && prepTime === 120 ? (
              <button 
                onClick={startPrep}
                className="bg-speaking-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-speaking-700 transition"
              >
                Start Preparation
              </button>
            ) : (
              <button 
                onClick={stopPrep}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Stop & Start Recording
              </button>
            )}
          </div>
        )}

        {/* Recording Section */}
        {!audioUrl && !feedback && (
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Record Your Answer</h3>
            
            {isRecording ? (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Mic className="w-10 h-10 text-red-600" />
                </div>
                <div className="text-3xl font-mono font-bold text-red-600">
                  {formatTime(recordingTime)}
                </div>
                <p className="text-gray-600">Recording in progress...</p>
                <button 
                  onClick={stopRecording}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2 mx-auto"
                >
                  <Square className="w-5 h-5" />
                  Stop Recording
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-speaking-100 rounded-full flex items-center justify-center mx-auto">
                  <Mic className="w-10 h-10 text-speaking-600" />
                </div>
                <p className="text-gray-600">
                  {prepTime < 120 ? 'Ready to record!' : 'Click below when ready'}
                </p>
                <button 
                  onClick={startRecording}
                  disabled={isPrepRunning}
                  className="bg-speaking-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-speaking-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Recording
                </button>
              </div>
            )}
          </div>
        )}

        {/* Playback & Submit */}
        {audioUrl && !feedback && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Your Recording</h3>
            <audio src={audioUrl} controls className="w-full mb-4" />
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setAudioUrl(null)
                  setAudioBlob(null)
                  setRecordingTime(0)
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Record Again
              </button>
              <button 
                onClick={submitToAI}
                disabled={isSubmitting}
                className="flex-1 bg-speaking-600 text-white py-3 rounded-lg font-semibold hover:bg-speaking-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Get AI Feedback'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* AI Feedback Results */}
        {feedback && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-speaking-600 text-white rounded-xl p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Your Band Score</h3>
              <div className="text-6xl font-bold">{feedback.overallBand}</div>
              <p className="text-speaking-100 mt-2">out of 9</p>
            </div>

            {/* Criteria Scores */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Scores</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium">Fluency & Coherence</p>
                  <p className="text-2xl font-bold text-blue-800">{feedback.fluency}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 font-medium">Lexical Resource</p>
                  <p className="text-2xl font-bold text-purple-800">{feedback.lexical}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium">Grammatical Range</p>
                  <p className="text-2xl font-bold text-green-800">{feedback.grammar}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-600 font-medium">Pronunciation</p>
                  <p className="text-2xl font-bold text-orange-800">{feedback.pronunciation}</p>
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {feedback.strengths.map((strength: string, i: number) => (
                  <li key={i} className="text-green-700 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement: string, i: number) => (
                  <li key={i} className="text-orange-700 flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Feedback */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Detailed Feedback</h3>
              <p className="text-gray-700 leading-relaxed">{feedback.detailedFeedback}</p>
            </div>

            {/* Try Again */}
            <div className="text-center pb-8">
              <button 
                onClick={() => {
                  setFeedback(null)
                  setAudioUrl(null)
                  setAudioBlob(null)
                  setRecordingTime(0)
                  setPrepTime(120)
                }}
                className="bg-speaking-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-speaking-700 transition"
              >
                Practice Another Question
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
