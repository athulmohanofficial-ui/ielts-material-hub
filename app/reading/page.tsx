import Link from 'next/link'
import { BookOpen, GraduationCap, Globe } from 'lucide-react'

export default function ReadingPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
          Reading Practice
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Choose your test type to begin
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Academic Option */}
          <Link href="/reading/academic" className="block">
            <div className="bg-white border-2 border-reading-500 rounded-2xl p-8 hover:shadow-xl transition text-center">
              <div className="w-20 h-20 bg-reading-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-reading-600" />
              </div>
              <h2 className="text-2xl font-bold text-reading-700 mb-3">
                Academic Training
              </h2>
              <p className="text-gray-600">
                For students applying for higher education or professional registration
              </p>
              <div className="mt-6 inline-flex items-center text-reading-600 font-semibold">
                Start Practice →
              </div>
            </div>
          </Link>

          {/* General Option */}
          <Link href="/reading/general" className="block">
            <div className="bg-white border-2 border-reading-500 rounded-2xl p-8 hover:shadow-xl transition text-center">
              <div className="w-20 h-20 bg-reading-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-10 h-10 text-reading-600" />
              </div>
              <h2 className="text-2xl font-bold text-reading-700 mb-3">
                General Training
              </h2>
              <p className="text-gray-600">
                For those migrating to English-speaking countries or training programs
              </p>
              <div className="mt-6 inline-flex items-center text-reading-600 font-semibold">
                Start Practice →
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
