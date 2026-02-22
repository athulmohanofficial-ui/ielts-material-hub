import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PenLine, ArrowLeft, Mail, FileText } from 'lucide-react'

async function getGeneralTasks() {
  const { data, error } = await supabase
    .from('writing_tasks')
    .select('*')
    .eq('category', 'general')
    .order('task_type', { ascending: true })
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
  
  return data || []
}

export default async function GeneralWritingPage() {
  const tasks = await getGeneralTasks()
  const task1 = tasks.filter(t => t.task_type === 1)
  const task2 = tasks.filter(t => t.task_type === 2)

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/writing" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">General Writing</h1>
            <p className="text-gray-600">Select a task to practice</p>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <PenLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tasks available yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Task 1 Section */}
            {task1.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Mail className="w-6 h-6 mr-2 text-green-600" />
                  Task 1: Letter Writing
                  <span className="ml-3 text-sm font-normal text-gray-500">(20 minutes, 150 words)</span>
                </h2>
                <div className="grid gap-4">
                  {task1.map((task) => (
                    <Link 
                      key={task.id} 
                      href={`/writing/${task.id}`}
                      className="block bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-writing-500 hover:shadow-lg transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{task.question_text}</p>
                        </div>
                        <div className="ml-4 text-writing-600 font-semibold">
                          Write →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Task 2 Section */}
            {task2.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-purple-600" />
                  Task 2: Essay Writing
                  <span className="ml-3 text-sm font-normal text-gray-500">(40 minutes, 250 words)</span>
                </h2>
                <div className="grid gap-4">
                  {task2.map((task) => (
                    <Link 
                      key={task.id} 
                      href={`/writing/${task.id}`}
                      className="block bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-writing-500 hover:shadow-lg transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{task.question_text}</p>
                        </div>
                        <div className="ml-4 text-writing-600 font-semibold">
                          Write →
                        </div>
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
