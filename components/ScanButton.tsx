'use client';

interface ScanButtonProps {
  onImageSelect: (file: File) => void;
  onScreenCapture: () => void;
  isLoading: boolean;
}

export default function ScanButton({ onImageSelect, onScreenCapture, isLoading }: ScanButtonProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Upload Screenshot Button */}
      <label 
        htmlFor="screenshot-upload" 
        className={`
          w-full max-w-md h-32 
          flex items-center justify-center
          text-3xl font-bold
          bg-blue-600 hover:bg-blue-700 
          text-white rounded-2xl
          cursor-pointer transition-colors
          shadow-lg
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isLoading ? '🔍 Scanning...' : '📸 Scan Screenshot'}
      </label>
      <input
        id="screenshot-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isLoading}
        className="hidden"
      />
      
      {/* Screen Capture Button */}
      <button
        onClick={onScreenCapture}
        disabled={isLoading}
        className={`
          w-full max-w-md h-32 
          flex items-center justify-center
          text-3xl font-bold
          bg-green-600 hover:bg-green-700 
          text-white rounded-2xl
          transition-colors
          shadow-lg
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        🖥️ Capture Screen
      </button>

      <p className="text-xl text-gray-600 text-center max-w-md">
        Upload a screenshot or capture your screen to check for scams
      </p>
    </div>
  );
}
