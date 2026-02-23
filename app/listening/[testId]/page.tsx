'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ChevronRight, 
  ChevronLeft,
  Volume2,
  FileText,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ListeningTestPage() {
  const params = useParams();
  const testId = params.testId as string;
  
  const [test, setTest] = useState<any>(null);
  const [currentPart, setCurrentPart] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (audioRef.current && test) {
      audioRef.current.play().catch(e => console.log('Auto-play blocked'));
      setIsPlaying(true);
    }
  }, [currentPart, test]);

  async function fetchTest() {
    const { data, error } = await supabase
      .from('listening_tests')
      .select('*')
      .eq('id', testId)
      .single();
    
    if (data) {
      setTest(data);
      setLoading(false);
    }
  }

  const getAudioUrl = () => {
    if (!test) return '';
    switch(currentPart) {
      case 1: return test.part1_audio;
      case 2: return test.part2_audio;
      case 3: return test.part3_audio;
      case 4: return test.part4_audio;
      default: return '';
    }
  };

  const getQuestionsUrl = () => {
    if (!test) return '';
    switch(currentPart) {
      case 1: return test.part1_questions;
      case 2: return test.part2_questions;
      case 3: return test.part3_questions;
      case 4: return test.part4_questions;
      default: return '';
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  };

  const goToPart = (part: number) => {
    if (part >= 1 && part <= 4) {
      setCurrentPart(part);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="p-8 text-center">Loading test...</div>;
  if (!test) return <div className="p-8 text-center">Test not found</div>;

  if (showAnswers) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-green-600">Answer Key: {test.title}</h1>
            <button
              onClick={() => setShowAnswers(false)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Listening
            </button>
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm">
            {test.answer_key || 'No answers provided yet.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{test.title}</h1>
            <p className="text-gray-600">Part {currentPart} of 4</p>
          </div>
          <Link 
            href="/listening" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Tests
          </Link>
        </div>

        {/* Part Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((part) => (
            <button
              key={part}
              onClick={() => goToPart(part)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                currentPart === part
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Part {part}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Audio Player */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-green-600" />
              Audio Player - Part {currentPart}
            </h2>

            <audio
              ref={audioRef}
              src={getAudioUrl()}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onLoadedMetadata={handleTimeUpdate}
            />

            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={skipBackward}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                title="Back 10 seconds"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="p-4 rounded-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>

              <button
                onClick={skipForward}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                title="Forward 10 seconds"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="w-4 h-4 text-gray-500" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setVolume(vol);
                  if (audioRef.current) audioRef.current.volume = vol;
                }}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>

            {/* Navigation Arrows */}
            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={() => goToPart(currentPart - 1)}
                disabled={currentPart === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  currentPart === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <button
                onClick={() => goToPart(currentPart + 1)}
                disabled={currentPart === 4}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  currentPart === 4
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Questions Image */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Part {currentPart} Questions
            </h2>
            
            <div className="bg-gray-50 rounded-lg overflow-hidden h-[500px] flex items-center justify-center">
              {getQuestionsUrl() ? (
                <img 
                  src={getQuestionsUrl()} 
                  alt={`Part ${currentPart} Questions`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>No questions uploaded for this part yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Show Answers Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAnswers(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 mx-auto"
          >
            <FileText className="w-5 h-5" />
            Show Answers
          </button>
        </div>
      </div>
    </div>
  );
}
