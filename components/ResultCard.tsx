'use client';

import { Verdict } from '@/lib/scorer';

interface ResultCardProps {
  verdict: Verdict;
  onSpeakAloud: () => void;
}

export default function ResultCard({ verdict, onSpeakAloud }: ResultCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Traffic Light */}
      <div className={`${verdict.color} rounded-3xl p-8 text-white shadow-xl`}>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{verdict.emoji}</span>
          <h2 className="text-4xl font-bold">{verdict.title}</h2>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Why?</h3>
        <p className="text-2xl text-gray-700 leading-relaxed mb-6">
          {verdict.explanation}
        </p>
        
        <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-500">
          <h4 className="text-2xl font-bold mb-3 text-gray-800">What to do:</h4>
          <p className="text-2xl text-gray-700 leading-relaxed">
            {verdict.advice}
          </p>
        </div>
      </div>

      {/* Read Aloud Button */}
      <button
        onClick={onSpeakAloud}
        className="w-full h-20 bg-purple-600 hover:bg-purple-700 text-white text-2xl font-bold rounded-2xl shadow-lg transition-colors"
      >
        🔊 Read Result Aloud
      </button>
    </div>
  );
}
