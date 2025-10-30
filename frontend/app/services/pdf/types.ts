// PDF Parser Service Types

export interface ParseResult {
  success: boolean;
  text?: string;
  error?: string;
  strategy: string;
  processingTime: number;
  pages?: number;
}

export interface FileValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileSize: number;
  fileType: string;
}

export interface ProcessingProgress {
  stage: 'validation' | 'parsing' | 'extraction' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number;
  currentPage?: number;
  totalPages?: number;
}

export interface ParsingStrategy {
  name: string;
  priority: number;
  isAvailable(): Promise<boolean>;
  parse(file: File, onProgress?: (progress: ProcessingProgress) => void): Promise<string>;
  getErrorMessage(error: Error): string;
}

export type ProgressCallback = (progress: ProcessingProgress) => void;