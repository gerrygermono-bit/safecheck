'use client';

import { useState } from 'react';
import ScanButton from '@/components/ScanButton';
import ResultCard from '@/components/ResultCard';
import { extractTextFromImage } from '@/lib/ocr';
import { detectScam } from '@/lib/detector';
import { getVerdict, Verdict } from '@/lib/scorer';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = async (file: File) => {
    setIsLoading(true);
    setVerdict(null);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Extract text
      const text = await extractTextFromImage(file);
      
      // Detect scam
      const detection = detectScam(text);
      
      // Get verdict
      const result = getVerdict(detection);
      setVerdict(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakAloud = () => {
    if (!verdict) return;
    
    const text = `${verdict.title}. ${verdict.explanation}. ${verdict.advice}`;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  const handleReset = () => {
    setVerdict(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🛡️ SafeCheck
          </h1>
          <p className="text-2xl text-gray-600">
            Simple, clear protection from online scams
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          {!verdict && !isLoading && (
            <ScanButton onImageSelect={handleImageSelect} isLoading={isLoading} />
          )}

          {isLoading && (
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-3xl font-semibold text-gray-700">
                  Analyzing your screenshot...
                </p>
                <p className="text-xl text-gray-500 mt-2">
                  This may take a few seconds
                </p>
              </div>
              {imagePreview && (
                <div className="mt-6">
                  <img 
                    src={imagePreview} 
                    alt="Screenshot preview" 
                    className="max-w-md mx-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          )}

          {verdict && (
            <>
              <ResultCard verdict={verdict} onSpeakAloud={handleSpeakAloud} />
              <button
                onClick={handleReset}
                className="w-full max-w-2xl mx-auto block h-20 bg-gray-600 hover:bg-gray-700 text-white text-2xl font-bold rounded-2xl shadow-lg transition-colors"
              >
                ↻ Scan Another Screenshot
              </button>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-lg text-gray-500">
          <p>Always verify suspicious messages by calling official numbers</p>
        </footer>
      </div>
    </div>
  );
}
