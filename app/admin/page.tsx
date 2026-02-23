'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Lock, 
  Unlock, 
  Upload, 
  FileText, 
  Headphones, 
  Mic, 
  PenLine, 
  Eye,
  LogOut,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Download
} from 'lucide-react'

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '123456'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [activeTab, setActiveTab] = useState('reading')

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_auth', 'true')
      setPinError('')
    } else {
      setPinError('Incorrect PIN. Try again.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_auth')
    setPin('')
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Enter PIN to continue</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-center text-2xl tracking-widest focus:border-blue-500 focus:outline-none"
              maxLength={6}
            />
            
            {pinError && (
              <p className="text-red-600 text-sm text-center">{pinError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Unlock
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Default PIN: 123456
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Unlock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage IELTS content</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <button
                onClick={() => setActiveTab('reading')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                  activeTab === 'reading' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Reading</span>
              </button>
              <button
                onClick={() => setActiveTab('listening')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                  activeTab === 'listening' ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'hover:bg-gray-50'
                }`}
              >
                <Headphones className="w-5 h-5" />
                <span className="font-medium">Listening</span>
              </button>
              <button
                onClick={() => setActiveTab('speaking-tests')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                  activeTab === 'speaking-tests' ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600' : 'hover:bg-gray-50'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span className="font-medium">Speaking Tests</span>
              </button>
              <button
                onClick={() => setActiveTab('writing')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                  activeTab === 'writing' ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-600' : 'hover:bg-gray-50'
                }`}
              >
                <PenLine className="w-5 h-5" />
                <span className="font-medium">Writing</span>
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                  activeTab === 'submissions' ? 'bg-gray-100 text-gray-800 border-l-4 border-gray-600' : 'hover:bg-gray-50'
                }`}
              >
                <Eye className="w-5 h-5" />
                <span className="font-medium">Submissions</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4">
            {activeTab === 'reading' && <ReadingUpload />}
            {activeTab === 'listening' && <ListeningManager />}
            {activeTab === 'speaking-tests' && <SpeakingTestsUpload />}
            {activeTab === 'writing' && <WritingUpload />}
            {activeTab === 'submissions' && <SubmissionsView />}
          </div>
        </div>
      </div>
    </main>
  )
}

function ReadingUpload() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('academic')
  const [passageFile, setPassageFile] = useState<File | null>(null)
  const [questionsFile, setQuestionsFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passageFile || !questionsFile || !title) return

    setUploading(true)
    setMessage('')

    try {
      const passageExt = passageFile.name.split('.').pop()
      const passagePath = `passages/${Date.now()}-passage.${passageExt}`
      const { error: passageError } = await supabase.storage
        .from('reading-passages')
        .upload(passagePath, passageFile)

      if (passageError) throw passageError

      const questionsExt = questionsFile.name.split('.').pop()
      const questionsPath = `questions/${Date.now()}-questions.${questionsExt}`
      const { error: questionsError } = await supabase.storage
        .from('reading-questions')
        .upload(questionsPath, questionsFile)

      if (questionsError) throw questionsError

      const { error: dbError } = await supabase.from('reading_tests').insert({
        title,
        category,
        passage_path: passagePath,
        questions_path: questionsPath
      })

      if (dbError) throw dbError

      setMessage('Reading test uploaded successfully!')
      setTitle('')
      setPassageFile(null)
      setQuestionsFile(null)
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-600" />
        Upload Reading Test
      </h2>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., Academic Reading Test 1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="academic">Academic</option>
            <option value="general">General Training</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reading Passage (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setPassageFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Questions (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setQuestionsFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Test
            </>
          )}
        </button>
      </form>
    </div>
  )
}

function ListeningManager() {
  const [view, setView] = useState<'upload' | 'list'>('list')
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTests()
  }, [])

  async function fetchTests() {
    const { data, error } = await supabase
      .from('listening_tests')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (data) setTests(data)
    setLoading(false)
  }

  async function deleteTest(testId: string, testTitle: string) {
    if (!confirm(`Are you sure you want to delete "${testTitle}"? This cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('listening_tests')
        .delete()
        .eq('id', testId)

      if (error) throw error

      fetchTests()
      alert('Test deleted successfully!')
    } catch (error: any) {
      alert('Error deleting test: ' + error.message)
    }
  }

  if (view === 'upload') {
    return <ListeningUploadForm onBack={() => { setView('list'); fetchTests(); }} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Headphones className="w-6 h-6 text-green-600" />
          Listening Tests
        </h2>
        <button
          onClick={() => setView('upload')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload New Test
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
          <Headphones className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No listening tests yet. Upload your first test!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tests.map((test, index) => (
            <div
              key={test.id}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{test.title}</h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(test.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => deleteTest(test.id, test.title)}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                title="Delete this test"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ListeningUploadForm({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState('')
  const [files, setFiles] = useState({
    part1_audio: null as File | null,
    part2_audio: null as File | null,
    part3_audio: null as File | null,
    part4_audio: null as File | null,
    part1_questions: null as File | null,
    part2_questions: null as File | null,
    part3_questions: null as File | null,
    part4_questions: null as File | null,
    answer_key: null as File | null,
  })
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('title', title)
      
      if (files.part1_audio) formData.append('part1_audio', files.part1_audio)
      if (files.part2_audio) formData.append('part2_audio', files.part2_audio)
      if (files.part3_audio) formData.append('part3_audio', files.part3_audio)
      if (files.part4_audio) formData.append('part4_audio', files.part4_audio)
      
      if (files.part1_questions) formData.append('part1_questions', files.part1_questions)
      if (files.part2_questions) formData.append('part2_questions', files.part2_questions)
      if (files.part3_questions) formData.append('part3_questions', files.part3_questions)
      if (files.part4_questions) formData.append('part4_questions', files.part4_questions)
      if (files.answer_key) formData.append('answer_key', files.answer_key)

      const res = await fetch('/api/listening/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (res.ok) {
        setMessage('Listening test uploaded successfully!')
        setTimeout(() => {
          onBack()
        }, 1500)
      } else {
        const error = await res.json()
        setMessage('Error: ' + error.error)
      }
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Headphones className="w-6 h-6 text-green-600" />
          Upload Listening Test (4 Parts)
        </h2>
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to List
        </button>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="e.g., Listening Test 1"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border p-4 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-800 mb-3">Part 1</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Audio (MP3)</label>
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg"
                  onChange={(e) => setFiles({...files, part1_audio: e.target.files?.[0] || null})}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Questions (Image/PDF)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFiles({...files, part1_questions: e.target.files?.[0] || null})}
                  className="w-full text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border p-4 rounded-lg bg-blue-50">
            <h3 className="font-semibold text-blue-800 mb-3">Part 2</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Audio (MP3)</label>
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg"
                  onChange={(e) => setFiles({...files, part2_audio: e.target.files?.[0] || null})}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Questions (Image/PDF)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFiles({...files, part2_questions: e.target.files?.[0] || null})}
                  className="w-full text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border p-4 rounded-lg bg-purple-50">
            <h3 className="font-semibold text-purple-800 mb-3">Part 3</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Audio (MP3)</label>
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg"
                  onChange={(e) => setFiles({...files, part3_audio: e.target.files?.[0] || null})}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Questions (Image/PDF)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFiles({...files, part3_questions: e.target.files?.[0] || null})}
                  className="w-full text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border p-4 rounded-lg bg-orange-50">
            <h3 className="font-semibold text-orange-800 mb-3">Part 4</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Audio (MP3)</label>
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg"
                  onChange={(e) => setFiles({...files, part4_audio: e.target.files?.[0] || null})}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Questions (Image/PDF)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFiles({...files, part4_questions: e.target.files?.[0] || null})}
                  className="w-full text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border p-4 rounded-lg bg-yellow-50 mt-4">
          <h3 className="font-semibold text-yellow-800 mb-3">Answer Key</h3>
          <div>
            <label className="text-xs text-gray-600">Answer Key (Image/PDF)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFiles({...files, answer_key: e.target.files?.[0] || null})}
              className="w-full text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Upload answer key as image or PDF file</p>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Test
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

function SpeakingTestsUpload() {
  const [title, setTitle] = useState('')
  const [introQuestions, setIntroQuestions] = useState(['', '', '', '', '', ''])
  const [cueCard, setCueCard] = useState('')
  const [followUpQuestions, setFollowUpQuestions] = useState(['', '', '', '', ''])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setMessage('')

    try {
      const { error } = await supabase.from('speaking_tests').insert({
        title,
        intro_q1: introQuestions[0],
        intro_q2: introQuestions[1],
        intro_q3: introQuestions[2],
        intro_q4: introQuestions[3],
        intro_q5: introQuestions[4],
        intro_q6: introQuestions[5],
        cue_card: cueCard,
        followup_q1: followUpQuestions[0],
        followup_q2: followUpQuestions[1],
        followup_q3: followUpQuestions[2],
        followup_q4: followUpQuestions[3],
        followup_q5: followUpQuestions[4],
      })

      if (error) throw error

      setMessage('Test created successfully!')
      setTitle('')
      setIntroQuestions(['', '', '', '', '', ''])
      setCueCard('')
      setFollowUpQuestions(['', '', '', '', ''])
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Mic className="w-6 h-6 text-purple-600" />
        Create Full Speaking Test
      </h2>

      <form onSubmit={handleUpload} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="e.g., Speaking Test 1"
            required
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-blue-800 mb-2">Part 1: Introduction (6 questions)</label>
          {introQuestions.map((q, i) => (
            <input
              key={i}
              type="text"
              value={q}
              onChange={(e) => {
                const newQs = [...introQuestions]
                newQs[i] = e.target.value
                setIntroQuestions(newQs)
              }}
              className="w-full px-4 py-2 border rounded-lg mb-2"
              placeholder={`Question ${i + 1}`}
            />
          ))}
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-purple-800 mb-2">Part 2: Cue Card</label>
          <textarea
            value={cueCard}
            onChange={(e) => setCueCard(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg h-32"
            placeholder="Describe a memorable journey.&#10;You should say:&#10;- Where it is&#10;- How you went there&#10;- Who you were with&#10;- And explain why it was memorable"
            required
          />
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-orange-800 mb-2">Part 3: Follow-up (5 questions)</label>
          {followUpQuestions.map((q, i) => (
            <input
              key={i}
              type="text"
              value={q}
              onChange={(e) => {
                const newQs = [...followUpQuestions]
                newQs[i] = e.target.value
                setFollowUpQuestions(newQs)
              }}
              className="w-full px-4 py-2 border rounded-lg mb-2"
              placeholder={`Question ${i + 1}`}
            />
          ))}
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
        >
          {uploading ? 'Creating...' : 'Create Test'}
        </button>
      </form>
    </div>
  )
}

function WritingUpload() {
  const [questionText, setQuestionText] = useState('')
  const [taskType, setTaskType] = useState(1)
  const [category, setCategory] = useState('academic')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText) return

    setUploading(true)
    setMessage('')

    try {
      let imageUrl = null

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const filePath = `images/${Date.now()}-task.${ext}`
        
        const { error: uploadError } = await supabase.storage
          .from('writing-images')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('writing-images')
          .getPublicUrl(filePath)
        
        imageUrl = publicUrl
      }

      const { error } = await supabase.from('writing_tasks').insert({
        question_text: questionText,
        task_type: taskType,
        category,
        image_url: imageUrl
      })

      if (error) throw error

      setMessage('Task added successfully!')
      setQuestionText('')
      setImageFile(null)
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <PenLine className="w-6 h-6 text-orange-600" />
        Add Writing Task
      </h2>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
          <select
            value={taskType}
            onChange={(e) => setTaskType(parseInt(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            <option value={1}>Task 1 - Graph/Letter (20 min)</option>
            <option value={2}>Task 2 - Essay (40 min)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            <option value="academic">Academic</option>
            <option value="general">General Training</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none h-32"
            placeholder="Enter the task question here..."
            required
          />
        </div>

        {taskType === 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart/Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        )}

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Add Task
            </>
          )}
        </button>
      </form>
    </div>
  )
}

function SubmissionsView() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSubmissions() {
      const { data: writingData } = await supabase
        .from('writing_submissions')
        .select('*, writing_tasks(title)')
        .order('created_at', { ascending: false })
      
      const { data: speakingData } = await supabase
        .from('speaking_recordings')
        .select('*, speaking_questions(question_text)')
        .order('created_at', { ascending: false })

      const combined = [
        ...(writingData || []).map(s => ({ ...s, type: 'writing' })),
        ...(speakingData || []).map(s => ({ ...s, type: 'speaking' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setSubmissions(combined)
      setLoading(false)
    }

    fetchSubmissions()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Student Submissions</h2>
      
      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
          No submissions yet
        </div>
      ) : (
        submissions.map((sub) => (
          <div key={sub.id} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  sub.type === 'writing' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {sub.type === 'writing' ? 'Writing' : 'Speaking'}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(sub.created_at).toLocaleDateString()}
                </span>
              </div>
              {sub.band_score && (
                <span className="text-lg font-bold text-gray-800">
                  Band: {sub.band_score}
                </span>
              )}
            </div>
            
            <p className="text-gray-700 text-sm mb-3">
              {sub.type === 'writing' ? sub.writing_tasks?.title : sub.speaking_questions?.question_text}
            </p>

            <div className="flex gap-2">
              {sub.type === 'writing' ? (
                <a 
                  href={sub.essay_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Download className="w-4 h-4" />
                  Download Essay
                </a>
              ) : (
                <a 
                  href={sub.audio_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Headphones className="w-4 h-4" />
                  Play Recording
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
