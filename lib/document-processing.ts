import mammoth from 'mammoth';
import { DOCUMENT_PROCESSING } from './constants';

interface PdfResult {
  text: string;
  numpages: number;
}

interface ExtractionResult {
  text: string;
  pageCount?: number;
}

async function parsePdf(buffer: Buffer): Promise<PdfResult> {
  const g: any = global as any;
  if (typeof g.DOMMatrix === 'undefined') {
    g.DOMMatrix = class {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      constructor(_: any = undefined) {}
      multiplySelf() { return this; }
      preMultiplySelf() { return this; }
      translateSelf() { return this; }
      scaleSelf() { return this; }
      rotateSelf() { return this; }
      invertSelf() { return this; }
      clone() { return this; }
    };
  }

  const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');

  const uint8Array = new Uint8Array(buffer);

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    disableWorker: true,
  });

  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;

  let fullText = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');

    fullText += pageText + '\n\n';
  }

  return {
    text: fullText.trim(),
    numpages: numPages,
  };
}

export async function extractTextFromDocument(
  buffer: Buffer,
  extension: string
): Promise<ExtractionResult> {
  const normalizedExtension = extension.toLowerCase();
  
  if (buffer.length > DOCUMENT_PROCESSING.MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  
  switch (normalizedExtension) {
    case 'pdf':
      const pdfData = await parsePdf(buffer);
      return { 
        text: pdfData.text, 
        pageCount: pdfData.numpages 
      };
    
    case 'docx':
    case 'doc':
      const docResult = await mammoth.extractRawText({ buffer });
      return { text: docResult.value };
    
    case 'txt':
    case 'md':
      if (buffer.length > 10 * 1024 * 1024) {
        throw new Error('Text file too large');
      }
      return { text: buffer.toString('utf-8') };
    
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

export function chunkText(text: string, chunkSize = DOCUMENT_PROCESSING.CHUNK_SIZE, overlap = 200): string[] {
  const chunks: string[] = [];
  
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  let previousChunk = '';
  
  for (const para of paragraphs) {
    const paraLength = para.length;
    
    if (currentChunk.length + paraLength > chunkSize) {
      if (currentChunk) {
        const finalChunk = previousChunk 
          ? previousChunk.slice(-overlap) + '\n\n' + currentChunk 
          : currentChunk;
        chunks.push(finalChunk.trim());
        previousChunk = currentChunk;
      }
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }
  
  if (currentChunk) {
    const finalChunk = previousChunk 
      ? previousChunk.slice(-overlap) + '\n\n' + currentChunk 
      : currentChunk;
    chunks.push(finalChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 50);
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

