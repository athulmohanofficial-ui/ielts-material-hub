import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Headphones, Clock, ArrowLeft, Play } from 'lucide-react'

async function getListeningTests() {
  const { data, error } = await supabase
    .from('listening_tests')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching tests:', error)
    return []
  }
  
  return data || []
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-700'
    case 'medium': return 'bg-yellow-100 text-yellow-700'
    case 'hard': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export default async function ListeningPage() {
  const tests = await getListeningTests()

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Listening Practice</h1>
            <p className="text-gray-600">Select a test to play audio</p>
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <Headphones className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tests available yet</p>
            <p className="text-gray-400">Check back later for new content</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <Link 
                key={test.id} 
                href={`/listening/${test.id}`}
                className="block bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-listening-500 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-listening-100 rounded-full flex items-center justify-center mr-4">
                      <Play className="w-7 h-7 text-listening-600 ml-1" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {test.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                          {test.difficulty}
                        </span>
                        <span className="text-gray-500 text-sm flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          30 minutes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-listening-600 font-semibold">
                    Start →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
