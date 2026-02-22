'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  Download,
  SkipBack,
  SkipForward
} from 'lucide-react'

export default function ListeningTestPage({ params }: { params: { testId: string } }) {
  const [test, setTest] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    async function fetchTest() {
      const { data, error } = await supabase
        .from('listening_tests')
        .select('*')
        .eq('id', params.testId)
        .single()
      
      if (data) {
        setTest(data)
      }
      setLoading(false)
    }
    
    fetchTest()
  }, [params.testId])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [test])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.volume = vol
      setVolume(vol)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-listening-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (!test) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Test not found</h1>
          <Link href="/listening" className="text-listening-600 mt-4 inline-block">
            ← Back to Listening
          </Link>
        </div>
      </main>
    )
  }

  const { data: { publicUrl } } = supabase.storage.from('listening-audio').getPublicUrl(test.audio_path)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/listening" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">{test.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Audio Player Card */}
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden mb-6">
          {/* Audio Element */}
          <audio 
            ref={audioRef} 
            src={publicUrl} 
            onEnded={() => setIsPlaying(false)}
          />

          {/* Main Controls */}
          <div className="bg-listening-600 text-white p-8">
            <div className="flex items-center justify-center gap-6 mb-6">
              <button 
                onClick={() => skip(-10)}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-16 h-16 bg-white text-listening-600 rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>
              
              <button 
                onClick={() => skip(10)}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
            
            <div className="flex justify-between text-sm font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Download */}
          <div className="p-6 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-600" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={handleVolume}
                className="w-24 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-listening-600"
              />
            </div>
            
            <a 
              href={publicUrl}
              download
              className="flex items-center gap-2 text-gray-600 hover:text-listening-600 transition"
            >
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Download Audio</span>
            </a>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Test Instructions</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-listening-600 mr-2">•</span>
              You will hear 4 sections of audio
            </li>
            <li className="flex items-start">
              <span className="text-listening-600 mr-2">•</span>
              Each section is played once only
            </li>
            <li className="flex items-start">
              <span className="text-listening-600 mr-2">•</span>
              You have time to read questions before each section
            </li>
            <li className="flex items-start">
              <span className="text-listening-600 mr-2">•</span>
              Write your answers on paper as you listen
            </li>
            <li className="flex items-start">
              <span className="text-listening-600 mr-2">•</span>
              You have 10 minutes at the end to transfer answers
            </li>
          </ul>
        </div>

        {/* Difficulty Badge */}
        <div className="mt-4 flex justify-center">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            test.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            Difficulty: {test.difficulty}
          </span>
        </div>
      </div>
    </main>
  )
}
