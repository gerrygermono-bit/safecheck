'use client';

interface ScanButtonProps {
  onImageSelect: (file: File) => void;
  isLoading: boolean;
}

export default function ScanButton({ onImageSelect, isLoading }: ScanButtonProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
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
      <p className="text-xl text-gray-600 text-center max-w-md">
        Upload a screenshot of a suspicious message, email, or text
      </p>
    </div>
  );
}
