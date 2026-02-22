import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'

async function getTest(testId: string) {
  const { data, error } = await supabase
    .from('reading_tests')
    .select('*')
    .eq('id', testId)
    .single()
  
  if (error) {
    console.error('Error fetching test:', error)
    return null
  }
  
  return data
}

function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export default async function ReadingTestPage({ params }: { params: { testId: string } }) {
  const test = await getTest(params.testId)
  
  if (!test) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Test not found</h1>
          <Link href="/reading" className="text-reading-600 mt-4 inline-block">
            ← Back to Reading
          </Link>
        </div>
      </main>
    )
  }

  const passageUrl = getPublicUrl('reading-passages', test.passage_path)
  const questionsUrl = getPublicUrl('reading-questions', test.questions_path)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/reading/${test.category}`} className="mr-4 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">{test.title}</h1>
          </div>
          <div className="text-sm text-gray-500">
            Time remaining: <span className="font-mono font-bold text-reading-600">60:00</span>
          </div>
        </div>
      </div>

      {/* Split Screen PDFs */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-120px)]">
          
          {/* Left: Passage */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
            <div className="bg-reading-50 px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-semibold text-reading-800">Reading Passage</h2>
              <a 
                href={passageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-reading-600 hover:text-reading-700"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe 
                src={passageUrl} 
                className="w-full h-full"
                title="Reading Passage"
              />
            </div>
          </div>

          {/* Right: Questions */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
            <div className="bg-reading-50 px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-semibold text-reading-800">Questions</h2>
              <a 
                href={questionsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-reading-600 hover:text-reading-700"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe 
                src={questionsUrl} 
                className="w-full h-full"
                title="Questions"
              />
            </div>
          </div>

        </div>

        {/* Instructions */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>Instructions:</strong> Read the passage on the left and answer the questions on the right. 
          Write your answers on paper. The timer above shows 60 minutes for this section.
        </div>
      </div>
    </main>
  )
}
