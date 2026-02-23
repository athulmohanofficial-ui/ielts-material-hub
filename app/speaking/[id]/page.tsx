'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Mic, Square, Volume2 } from 'lucide-react'

export default function SpeakingTest({ params }: { params: { id: string } }) {
  const [test, setTest] = useState<any>(null)
  const [step, setStep] = useState(0) // 0=start, 1-6=intro, 7=cue prep, 8=cue record, 9-13=followup, 14=done
  const [loading, setLoading] = useState(true)
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState<string[]>([])
  
  // Timers
  const [prepTime, setPrepTime] = useState(60)
  const [recordTime, setRecordTime] = useState(0)
  
  // Auto-start recording when prep hits 0
  const [autoStartRecording, setAutoStartRecording] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const prepTimerRef = useRef<NodeJS.Timeout | null>(null)
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function fetchTest() {
      const { data } = await supabase
        .from('speaking_tests')
        .select('*')
        .eq('id', params.id)
        .single()
      setTest(data)
      setLoading(false)
    }
    fetchTest()
  }, [params.id])

  // Handle auto-start recording when prep ends
  useEffect(() => {
    if (autoStartRecording && prepTime === 0 && step === 7) {
      setAutoStartRecording(false)
      setStep(8)
      startRecording()
    }
  }, [prepTime, autoStartRecording, step])

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const startPrepTimer = () => {
    setAutoStartRecording(true)
    prepTimerRef.current = setInterval(() => {
      setPrepTime((prev) => {
        if (prev <= 1) {
          if (prepTimerRef.current) clearInterval(prepTimerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        
        const newRecordings = [...recordings]
        newRecordings[6] = url // Cue card is at index 6
        setRecordings(newRecordings)
        
        stream.getTracks().forEach(track => track.stop())
        
        // Move to follow-up after recording stops
        setStep(9)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordTime(0)

      // Recording timer - counts UP to 120
      recordTimerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= 119) { // Stop at 120 seconds
            if (recordTimerRef.current) clearInterval(recordTimerRef.current)
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop()
            }
            setIsRecording(false)
            return 120
          }
          return prev + 1
        })
      }, 1000)

    } catch (err) {
      alert('Microphone not working')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordTimerRef.current) clearInterval(recordTimerRef.current)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCurrentQuestion = () => {
    if (!test) return ''
    switch(step) {
      case 1: return test.intro_q1
      case 2: return test.intro_q2
      case 3: return test.intro_q3
      case 4: return test.intro_q4
      case 5: return test.intro_q5
      case 6: return test.intro_q6
      case 7: 
      case 8: return test.cue_card
      case 9: return test.followup_q1
      case 10: return test.followup_q2
      case 11: return test.followup_q3
      case 12: return test.followup_q4
      case 13: return test.followup_q5
      default: return ''
    }
  }

  const getStepDisplay = () => {
    if (step === 0) return 'Start'
    if (step >= 1 && step <= 6) return `Introduction ${step}/6`
    if (step === 7) return 'Cue Card - Preparation'
    if (step === 8) return 'Cue Card - Speaking'
    if (step >= 9 && step <= 13) return `Follow-up ${step - 8}/5`
    return 'Complete'
  }

  const handleNext = () => {
    if (step < 14) {
      setStep(step + 1)
    }
  }

  const handlePreviousRecording = () => {
    const newRecordings = [...recordings]
    newRecordings[step - 1] = ''
    setRecordings(newRecordings)
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (!test) return <div className="p-8 text-center">Test not found</div>

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/speaking" className="mr-4 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-bold text-gray-800">{test.title}</h1>
          </div>
          <span className="text-sm text-gray-500">{getStepDisplay()}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* START SCREEN */}
        {step === 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Speaking Test</h2>
            <p className="text-gray-600 mb-6">
              This test has 3 parts:<br/>
              • 6 Introduction questions<br/>
              • 1 Cue card (60 sec prep + 2 min speaking)<br/>
              • 5 Follow-up questions
            </p>
            <button 
              onClick={() => setStep(1)}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Start Test
            </button>
          </div>
        )}

        {/* INTRO QUESTIONS (1-6) */}
        {step >= 1 && step <= 6 && (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-blue-600 font-medium">Part 1: Introduction</span>
              <button onClick={() => speak(getCurrentQuestion())} className="text-gray-500 hover:text-blue-600">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="text-lg text-gray-800">{getCurrentQuestion()}</p>
            </div>

            {!recordings[step - 1] ? (
              <div className="text-center">
                {isRecording ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Mic className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-red-600 font-mono text-2xl">{formatTime(recordTime)}</p>
                    <button onClick={stopRecording} className="bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto">
                      <Square className="w-4 h-4" /> Stop
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={async () => {
                      try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                        const mediaRecorder = new MediaRecorder(stream)
                        mediaRecorderRef.current = mediaRecorder
                        chunksRef.current = []

                        mediaRecorder.ondataavailable = (e) => {
                          if (e.data.size > 0) chunksRef.current.push(e.data)
                        }

                        mediaRecorder.onstop = () => {
                          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                          const url = URL.createObjectURL(blob)
                          const newRecordings = [...recordings]
                          newRecordings[step - 1] = url
                          setRecordings(newRecordings)
                          stream.getTracks().forEach(track => track.stop())
                        }

                        mediaRecorder.start()
                        setIsRecording(true)
                        setRecordTime(0)

                        recordTimerRef.current = setInterval(() => {
                          setRecordTime(prev => prev + 1)
                        }, 1000)

                      } catch (err) {
                        alert('Microphone not working')
                      }
                    }} 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                  >
                    Record Answer
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <audio src={recordings[step - 1]} controls className="w-full" />
                <div className="flex gap-2">
                  <button 
                    onClick={handlePreviousRecording}
                    className="flex-1 bg-gray-200 py-2 rounded-lg"
                  >
                    Record Again
                  </button>
                  <button 
                    onClick={handleNext}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                  >
                    {step === 6 ? 'Go to Cue Card' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CUE CARD PREP (Step 7) */}
        {step === 7 && (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Part 2: Cue Card</h2>
            <p className="text-gray-600 mb-6">Prepare for 1 minute</p>
            
            <div className="bg-purple-50 rounded-lg p-6 mb-6 text-left">
              <p className="text-lg text-gray-800 whitespace-pre-line">{test.cue_card}</p>
            </div>

            <div className="text-6xl font-mono font-bold text-purple-600 mb-6">
              {formatTime(prepTime)}
            </div>

            {prepTime === 60 && (
              <button 
                onClick={startPrepTimer}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Start Preparation
              </button>
            )}

            {prepTime < 60 && prepTime > 0 && (
              <p className="text-gray-600">Preparing... recording starts automatically</p>
            )}

            {prepTime === 0 && (
              <p className="text-purple-600 font-semibold">Starting recording...</p>
            )}
          </div>
        )}

        {/* CUE CARD RECORDING (Step 8) */}
        {step === 8 && (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Part 2: Speak Now</h2>
            <p className="text-gray-600 mb-4">Speak for up to 2 minutes</p>
            
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <p className="text-gray-800">{test.cue_card}</p>
            </div>

            {!recordings[6] ? (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Mic className="w-10 h-10 text-red-600" />
                </div>
                <p className="text-red-600 font-mono text-4xl">{formatTime(recordTime)}</p>
                <p className="text-gray-600">Recording... (auto-stops at 2:00)</p>
                <button onClick={stopRecording} className="bg-red-600 text-white px-6 py-2 rounded-lg">
                  Stop Early
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <audio src={recordings[6]} controls className="w-full" />
                <button 
                  onClick={() => {
                    setRecordings(prev => {
                      const newRecs = [...prev]
                      newRecs[6] = ''
                      return newRecs
                    })
                    setPrepTime(60)
                    setRecordTime(0)
                    setStep(7)
                  }}
                  className="bg-gray-200 px-4 py-2 rounded-lg mr-2"
                >
                  Record Again
                </button>
                <button 
                  onClick={() => setStep(9)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg"
                >
                  Continue to Follow-up
                </button>
              </div>
            )}
          </div>
        )}

        {/* FOLLOW-UP QUESTIONS (9-13) */}
        {step >= 9 && step <= 13 && (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-orange-600 font-medium">Part 3: Follow-up</span>
              <button onClick={() => speak(getCurrentQuestion())} className="text-gray-500 hover:text-orange-600">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-orange-50 rounded-lg p-6 mb-6">
              <p className="text-lg text-gray-800">{getCurrentQuestion()}</p>
            </div>

            {!recordings[step - 3] ? (
              <div className="text-center">
                {isRecording ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Mic className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-red-600 font-mono text-2xl">{formatTime(recordTime)}</p>
                    <button onClick={stopRecording} className="bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto">
                      <Square className="w-4 h-4" /> Stop
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={async () => {
                      try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                        const mediaRecorder = new MediaRecorder(stream)
                        mediaRecorderRef.current = mediaRecorder
                        chunksRef.current = []

                        mediaRecorder.ondataavailable = (e) => {
                          if (e.data.size > 0) chunksRef.current.push(e.data)
                        }

                        mediaRecorder.onstop = () => {
                          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                          const url = URL.createObjectURL(blob)
                          const newRecordings = [...recordings]
                          newRecordings[step - 3] = url
                          setRecordings(newRecordings)
                          stream.getTracks().forEach(track => track.stop())
                        }

                        mediaRecorder.start()
                        setIsRecording(true)
                        setRecordTime(0)

                        recordTimerRef.current = setInterval(() => {
                          setRecordTime(prev => prev + 1)
                        }, 1000)

                      } catch (err) {
                        alert('Microphone not working')
                      }
                    }} 
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg"
                  >
                    Record Answer
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <audio src={recordings[step - 3]} controls className="w-full" />
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const newRecordings = [...recordings]
                      newRecordings[step - 3] = ''
                      setRecordings(newRecordings)
                    }}
                    className="flex-1 bg-gray-200 py-2 rounded-lg"
                  >
                    Record Again
                  </button>
                  <button 
                    onClick={handleNext}
                    className="flex-1 bg-orange-600 text-white py-2 rounded-lg"
                  >
                    {step === 13 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DONE SCREEN */}
        {step === 14 && (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Complete! 🎉</h2>
            <p className="text-gray-600 mb-6">
              You answered:<br/>
              • 6 Introduction questions<br/>
              • 1 Cue card<br/>
              • 5 Follow-up questions
            </p>
            <Link href="/speaking" className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold inline-block">
              Back to Tests
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
