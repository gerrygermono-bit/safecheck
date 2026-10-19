import { createWorker } from 'tesseract.js';

export async function extractTextFromImage(imageFile: File): Promise<string> {
  const worker = await createWorker('eng');
  
  try {
    const { data: { text } } = await worker.recognize(imageFile);
    return text;
  } finally {
    await worker.terminate();
  }
}
