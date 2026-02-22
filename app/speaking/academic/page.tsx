import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Mic, ArrowLeft, MessageCircle, BookOpen, Users } from 'lucide-react'

async function getAcademicQuestions() {
  const { data, error } = await supabase
    .from('speaking_questions')
    .select('*')
    .eq('category', 'academic')
    .order('part', { ascending: true })
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching questions:', error)
    return []
  }
  
  return data || []
}

function getPartIcon(part: number) {
  switch (part) {
    case 1: return <MessageCircle className="w-6 h-6 text-blue-600" />
    case 2: return <BookOpen className="w-6 h-6 text-purple-600" />
    case 3: return <Users className="w-6 h-6 text-orange-600" />
    default: return <Mic className="w-6 h-6 text-gray-600" />
  }
}

function getPartColor(part: number) {
  switch (part) {
    case 1: return 'bg-blue-50 border-blue-200'
    case 2: return 'bg-purple-50 border-purple-200'
    case 3: return 'bg-orange-50 border-orange-200'
    default: return 'bg-gray-50 border-gray-200'
  }
}

function getPartBadge(part: number) {
  const colors = {
    1: 'bg-blue-100 text-blue-700',
    2: 'bg-purple-100 text-purple-700',
    3: 'bg-orange-100 text-orange-700'
  }
  return colors[part as keyof typeof colors] || 'bg-gray-100 text-gray-700'
}

export default async function AcademicSpeakingPage() {
  const questions = await getAcademicQuestions()

  const part1 = questions.filter(q => q.part === 1)
  const part2 = questions.filter(q => q.part === 2)
  const part3 = questions.filter(q => q.part === 3)

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/speaking" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Academic Speaking</h1>
            <p className="text-gray-600">Select a question to practice</p>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No questions available yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Part 1 */}
            {part1.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  Part 1: Introduction & Interview
                  <span className="ml-3 text-sm font-normal text-gray-500">(4-5 minutes)</span>
                </h2>
                <div className="grid gap-3">
                  {part1.map((q) => (
                    <Link 
                      key={q.id} 
                      href={`/speaking/${q.id}`}
                      className={`block rounded-xl p-4 border-2 hover:shadow-md transition ${getPartColor(1)}`}
                    >
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">{getPartIcon(1)}</div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{q.question_text}</p>
                        </div>
                        <span className="text-speaking-600 font-semibold text-sm">Practice →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Part 2 */}
            {part2.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                  Part 2: Individual Long Turn
                  <span className="ml-3 text-sm font-normal text-gray-500">(3-4 minutes)</span>
                </h2>
                <div className="grid gap-3">
                  {part2.map((q) => (
                    <Link 
                      key={q.id} 
                      href={`/speaking/${q.id}`}
                      className={`block rounded-xl p-4 border-2 hover:shadow-md transition ${getPartColor(2)}`}
                    >
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">{getPartIcon(2)}</div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{q.question_text}</p>
                          {q.cue_card && (
                            <div className="mt-2 text-sm text-gray-600 bg-white/50 rounded p-2">
                              <strong>Cue Card:</strong> {q.cue_card}
                            </div>
                          )}
                        </div>
                        <span className="text-speaking-600 font-semibold text-sm">Practice →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Part 3 */}
            {part3.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                  Part 3: Two-way Discussion
                  <span className="ml-3 text-sm font-normal text-gray-500">(4-5 minutes)</span>
                </h2>
                <div className="grid gap-3">
                  {part3.map((q) => (
                    <Link 
                      key={q.id} 
                      href={`/speaking/${q.id}`}
                      className={`block rounded-xl p-4 border-2 hover:shadow-md transition ${getPartColor(3)}`}
                    >
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">{getPartIcon(3)}</div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{q.question_text}</p>
                        </div>
                        <span className="text-speaking-600 font-semibold text-sm">Practice →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
