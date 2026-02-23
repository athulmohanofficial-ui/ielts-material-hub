'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Headphones, Play } from 'lucide-react';

export default function ListeningPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  async function fetchTests() {
    const { data, error } = await supabase
      .from('listening_tests')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) setTests(data);
    setLoading(false);
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-green-600">Listening Tests</h1>
        <p className="text-center text-gray-600 mb-8">Practice with IELTS listening audio</p>

        <div className="grid gap-4">
          {tests.map((test, index) => (
            <Link
              key={test.id}
              href={`/listening/${test.id}`}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-green-500 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{test.title}</h2>
                  <p className="text-sm text-gray-500">Test {index + 1}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <span className="font-medium">Start Test</span>
                <Play className="w-5 h-5" />
              </div>
            </Link>
          ))}
        </div>

        {tests.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No listening tests available yet.</p>
        )}
      </div>
    </div>
  );
}
