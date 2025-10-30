import { ParseResult, FileValidation, ParsingStrategy, ProgressCallback, ProcessingProgress } from './types';

export class PDFParserService {
  private strategies: ParsingStrategy[] = [];
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedMimeTypes = ['application/pdf'];

  constructor() {
    // Strategies will be registered in order of priority
  }

  /**
   * Register a parsing strategy
   */
  registerStrategy(strategy: ParsingStrategy): void {
    this.strategies.push(strategy);
    // Sort by priority (higher priority first)
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get all registered parsing strategies
   */
  getParsingStrategies(): ParsingStrategy[] {
    return [...this.strategies];
  }

  /**
   * Validate PDF file before processing
   */
  validateFile(file: File): FileValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file type
    if (!this.allowedMimeTypes.includes(file.type)) {
      errors.push('File must be a PDF document');
    }

    // Check file extension as additional validation
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      errors.push('File must have a .pdf extension');
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size must be less than ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check if file is empty
    if (file.size === 0) {
      errors.push('File cannot be empty');
    }

    // Warnings for large files
    if (file.size > 5 * 1024 * 1024) {
      warnings.push('Large file detected - processing may take longer');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileSize: file.size,
      fileType: file.type
    };
  }

  /**
   * Parse PDF file using available strategies with fallback
   */
  async parseFile(file: File, onProgress?: ProgressCallback): Promise<ParseResult> {
    const startTime = Date.now();

    // Validate file first
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        strategy: 'validation',
        processingTime: Date.now() - startTime
      };
    }

    // Report validation complete
    onProgress?.({
      stage: 'validation',
      progress: 10,
      message: 'File validation complete'
    });

    // Try each strategy in order of priority
    for (const strategy of this.strategies) {
      try {
        // Check if strategy is available
        const isAvailable = await strategy.isAvailable();
        if (!isAvailable) {
          console.warn(`Strategy ${strategy.name} is not available, trying next...`);
          continue;
        }

        onProgress?.({
          stage: 'parsing',
          progress: 20,
          message: `Attempting to parse with ${strategy.name}...`
        });

        // Attempt parsing with this strategy
        const text = await strategy.parse(file, onProgress);
        
        const processingTime = Date.now() - startTime;
        
        onProgress?.({
          stage: 'complete',
          progress: 100,
          message: 'PDF parsing completed successfully'
        });

        return {
          success: true,
          text,
          strategy: strategy.name,
          processingTime
        };

      } catch (error) {
        console.warn(`Strategy ${strategy.name} failed:`, error);
        
        // If this is the last strategy, report the error
        if (strategy === this.strategies[this.strategies.length - 1]) {
          const processingTime = Date.now() - startTime;
          
          onProgress?.({
            stage: 'error',
            progress: 0,
            message: 'All parsing methods failed'
          });

          return {
            success: false,
            error: strategy.getErrorMessage(error as Error),
            strategy: strategy.name,
            processingTime
          };
        }
      }
    }

    // No strategies available
    const processingTime = Date.now() - startTime;
    
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: 'No parsing methods available'
    });

    return {
      success: false,
      error: 'No PDF parsing strategies are available. Please try pasting your resume text manually.',
      strategy: 'none',
      processingTime
    };
  }

  /**
   * Set maximum file size limit
   */
  setMaxFileSize(sizeInBytes: number): void {
    this.maxFileSize = sizeInBytes;
  }

  /**
   * Get current file size limit
   */
  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  /**
   * Check if any parsing strategies are available
   */
  async hasAvailableStrategies(): Promise<boolean> {
    for (const strategy of this.strategies) {
      if (await strategy.isAvailable()) {
        return true;
      }
    }
    return false;
  }
}