import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Mic, ArrowLeft, Clock } from 'lucide-react'

async function getTests() {
  const { data } = await supabase
    .from('speaking_tests')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function SpeakingPage() {
  const tests = await getTests()

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Speaking Tests</h1>
            <p className="text-gray-600">Full tests with all 3 parts</p>
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tests yet. Add in admin.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <Link 
                key={test.id} 
                href={`/speaking/${test.id}`}
                className="block bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Mic className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{test.title}</h3>
                      <p className="text-gray-500 text-sm flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-1" /> 11-14 minutes
                      </p>
                    </div>
                  </div>
                  <span className="text-purple-600 font-semibold">Start →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
