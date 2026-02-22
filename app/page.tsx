import Link from 'next/link'
import { BookOpen, Headphones, Mic, PenLine } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        IELTS Material Hub
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Reading Card */}
        <Link href="/reading" className="block">
          <div className="bg-reading-50 border-2 border-reading-500 rounded-xl p-8 hover:shadow-lg transition">
            <BookOpen className="w-12 h-12 text-reading-600 mb-4" />
            <h2 className="text-2xl font-bold text-reading-700">Reading</h2>
            <p className="text-gray-600 mt-2">Practice with PDF passages</p>
          </div>
        </Link>

        {/* Listening Card */}
        <Link href="/listening" className="block">
          <div className="bg-listening-50 border-2 border-listening-500 rounded-xl p-8 hover:shadow-lg transition">
            <Headphones className="w-12 h-12 text-listening-600 mb-4" />
            <h2 className="text-2xl font-bold text-listening-700">Listening</h2>
            <p className="text-gray-600 mt-2">Audio practice tests</p>
          </div>
        </Link>

        {/* Speaking Card */}
        <Link href="/speaking" className="block">
          <div className="bg-speaking-50 border-2 border-speaking-500 rounded-xl p-8 hover:shadow-lg transition">
            <Mic className="w-12 h-12 text-speaking-600 mb-4" />
            <h2 className="text-2xl font-bold text-speaking-700">Speaking</h2>
            <p className="text-gray-600 mt-2">Record answers, get AI feedback</p>
          </div>
        </Link>

        {/* Writing Card */}
        <Link href="/writing" className="block">
          <div className="bg-writing-50 border-2 border-writing-500 rounded-xl p-8 hover:shadow-lg transition">
            <PenLine className="w-12 h-12 text-writing-600 mb-4" />
            <h2 className="text-2xl font-bold text-writing-700">Writing</h2>
            <p className="text-gray-600 mt-2">Type essays, get AI corrections</p>
          </div>
        </Link>
      </div>
    </main>
  )
}
