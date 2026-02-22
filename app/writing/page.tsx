import Link from 'next/link'
import { PenLine, GraduationCap, Globe, ArrowLeft, FileText, Edit3 } from 'lucide-react'

export default function WritingPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Writing Practice</h1>
            <p className="text-gray-600">Choose your test type</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Academic Option */}
          <Link href="/writing/academic" className="block">
            <div className="bg-white border-2 border-writing-500 rounded-2xl p-8 hover:shadow-xl transition">
              <div className="w-20 h-20 bg-writing-100 rounded-full flex items-center justify-center mb-6">
                <GraduationCap className="w-10 h-10 text-writing-600" />
              </div>
              <h2 className="text-2xl font-bold text-writing-700 mb-3">Academic</h2>
              <p className="text-gray-600 mb-4">
                Task 1: Graphs, charts, diagrams<br/>
                Task 2: Essay on academic topics
              </p>
              <div className="flex gap-2 text-sm">
                <span className="bg-writing-50 text-writing-700 px-3 py-1 rounded-full">Task 1</span>
                <span className="bg-writing-50 text-writing-700 px-3 py-1 rounded-full">Task 2</span>
              </div>
            </div>
          </Link>

          {/* General Option */}
          <Link href="/writing/general" className="block">
            <div className="bg-white border-2 border-writing-500 rounded-2xl p-8 hover:shadow-xl transition">
              <div className="w-20 h-20 bg-writing-100 rounded-full flex items-center justify-center mb-6">
                <Globe className="w-10 h-10 text-writing-600" />
              </div>
              <h2 className="text-2xl font-bold text-writing-700 mb-3">General Training</h2>
              <p className="text-gray-600 mb-4">
                Task 1: Letters (formal/informal)<br/>
                Task 2: Essay on general topics
              </p>
              <div className="flex gap-2 text-sm">
                <span className="bg-writing-50 text-writing-700 px-3 py-1 rounded-full">Task 1</span>
                <span className="bg-writing-50 text-writing-700 px-3 py-1 rounded-full">Task 2</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-writing-50 border border-writing-200 rounded-xl p-6">
          <h3 className="font-semibold text-writing-800 mb-3 flex items-center">
            <PenLine className="w-5 h-5 mr-2" />
            How it works:
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Choose Academic or General Training</li>
            <li>• Select Task 1 or Task 2</li>
            <li>• Type your essay in the editor</li>
            <li>• Watch the live word count and timer</li>
            <li>• Submit to AI for instant feedback and corrections</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
