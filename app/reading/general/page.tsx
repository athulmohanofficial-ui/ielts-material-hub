import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FileText, Clock, ArrowLeft } from 'lucide-react'

async function getGeneralTests() {
  const { data, error } = await supabase
    .from('reading_tests')
    .select('*')
    .eq('category', 'general')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching tests:', error)
    return []
  }
  
  return data || []
}

export default async function GeneralReadingPage() {
  const tests = await getGeneralTests()

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/reading" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">General Reading</h1>
            <p className="text-gray-600">Select a test to begin practice</p>
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tests available yet</p>
            <p className="text-gray-400">Check back later for new content</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <Link 
                key={test.id} 
                href={`/reading/${test.id}`}
                className="block bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-reading-500 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-reading-100 rounded-lg flex items-center justify-center mr-4">
                      <FileText className="w-6 h-6 text-reading-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {test.title}
                      </h3>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">60 minutes</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-reading-600 font-semibold">
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
