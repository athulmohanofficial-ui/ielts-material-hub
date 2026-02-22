import Link from 'next/link'
import { Mic, GraduationCap, Globe, ArrowLeft } from 'lucide-react'

export default function SpeakingPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Speaking Practice</h1>
            <p className="text-gray-600">Choose your test type</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Academic Option */}
          <Link href="/speaking/academic" className="block">
            <div className="bg-white border-2 border-speaking-500 rounded-2xl p-8 hover:shadow-xl transition text-center">
              <div className="w-20 h-20 bg-speaking-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-speaking-600" />
              </div>
              <h2 className="text-2xl font-bold text-speaking-700 mb-3">
                Academic
              </h2>
              <p className="text-gray-600">
                Formal topics for university and professional contexts
              </p>
              <div className="mt-6 inline-flex items-center text-speaking-600 font-semibold">
                Start Practice →
              </div>
            </div>
          </Link>

          {/* General Option */}
          <Link href="/speaking/general" className="block">
            <div className="bg-white border-2 border-speaking-500 rounded-2xl p-8 hover:shadow-xl transition text-center">
              <div className="w-20 h-20 bg-speaking-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-10 h-10 text-speaking-600" />
              </div>
              <h2 className="text-2xl font-bold text-speaking-700 mb-3">
                General Training
              </h2>
              <p className="text-gray-600">
                Everyday topics for work and social contexts
              </p>
              <div className="mt-6 inline-flex items-center text-speaking-600 font-semibold">
                Start Practice →
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-speaking-50 border border-speaking-200 rounded-xl p-6">
          <h3 className="font-semibold text-speaking-800 mb-2 flex items-center">
            <Mic className="w-5 h-5 mr-2" />
            How it works:
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Select a question (Part 1, 2, or 3)</li>
            <li>• Click the microphone to record your answer</li>
            <li>• AI will analyze and give you a band score</li>
            <li>• Get feedback on fluency, vocabulary, grammar, and pronunciation</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
