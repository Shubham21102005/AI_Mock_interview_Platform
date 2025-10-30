import { ParsingStrategy, ProgressCallback, ProcessingProgress } from '../types';

export class CDNPDFStrategy implements ParsingStrategy {
  name = 'CDN PDF.js Worker';
  priority = 80; // Lower priority than local strategy

  private cdnWorkerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  private timeout = 30000; // 30 seconds timeout
  private maxRetries = 2;

  /**
   * Check if CDN PDF.js worker is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Test CDN availability with a quick HEAD request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for availability check
      
      const response = await fetch(this.cdnWorkerUrl, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('CDN PDF.js worker not available:', error);
      return false;
    }
  }

  /**
   * Parse PDF using CDN PDF.js worker with retry logic
   */
  async parse(file: File, onProgress?: ProgressCallback): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        onProgress?.({
          stage: 'parsing',
          progress: 30,
          message: `Loading PDF with CDN worker (attempt ${attempt}/${this.maxRetries})...`
        });

        const result = await this.attemptParse(file, onProgress, attempt);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`CDN PDF parsing attempt ${attempt} failed:`, error);
        
        if (attempt < this.maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    throw lastError || new Error('CDN PDF parsing failed after all retry attempts');
  }

  /**
   * Single parsing attempt with timeout
   */
  private async attemptParse(file: File, onProgress?: ProgressCallback, attempt: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`PDF processing timed out after ${this.timeout / 1000} seconds`));
      }, this.timeout);

      try {
        // Dynamic import for pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set up CDN worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = this.cdnWorkerUrl;
        
        onProgress?.({
          stage: 'parsing',
          progress: 35,
          message: `Connecting to CDN worker (attempt ${attempt})...`
        });

        const reader = new FileReader();
        
        reader.onload = async () => {
          try {
            const arrayBuffer = reader.result as ArrayBuffer;
            
            onProgress?.({
              stage: 'parsing',
              progress: 45,
              message: 'Processing PDF document with CDN worker...'
            });

            const pdf = await pdfjsLib.getDocument({ 
              data: arrayBuffer,
              // CDN-specific options for better reliability
              verbosity: 0,
              maxImageSize: 1024 * 1024,
              disableFontFace: true,
              disableRange: true, // More conservative for CDN
              disableStream: true, // More conservative for CDN
              stopAtErrors: false // Continue on minor errors
            }).promise;
            
            const totalPages = pdf.numPages;
            let fullText = '';
            
            onProgress?.({
              stage: 'extraction',
              progress: 55,
              message: `Extracting text from ${totalPages} pages via CDN...`,
              totalPages
            });

            // Extract text from all pages with error handling
            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
              try {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                
                // Extract and clean text
                const pageText = textContent.items
                  .map((item: any) => {
                    if (typeof item === 'object' && item.str) {
                      return item.str;
                    }
                    return '';
                  })
                  .filter(text => text.trim().length > 0)
                  .join(' ');
                
                if (pageText.trim()) {
                  fullText += pageText + '\n\n';
                }

                // Update progress
                const progress = 55 + (pageNum / totalPages) * 35;
                onProgress?.({
                  stage: 'extraction',
                  progress: Math.round(progress),
                  message: `Processed page ${pageNum} of ${totalPages} via CDN`,
                  currentPage: pageNum,
                  totalPages
                });

                // Clean up page resources
                page.cleanup();
              } catch (pageError) {
                console.warn(`Failed to extract text from page ${pageNum} via CDN:`, pageError);
                // Continue with other pages
              }
            }

            // Clean up PDF document
            pdf.destroy();
            clearTimeout(timeoutId);
            
            if (!fullText.trim()) {
              throw new Error('No text content found in PDF via CDN. The document may be image-based or corrupted.');
            }

            onProgress?.({
              stage: 'extraction',
              progress: 95,
              message: 'CDN text extraction completed...'
            });

            resolve(fullText.trim());
          } catch (pdfError) {
            clearTimeout(timeoutId);
            reject(new Error(`CDN PDF processing failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`));
          }
        };
        
        reader.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error('Failed to read PDF file for CDN processing'));
        };
        
        reader.readAsArrayBuffer(file);
      } catch (importError) {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to load PDF.js library from CDN: ${importError instanceof Error ? importError.message : 'Unknown error'}`));
      }
    });
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout')) {
      return 'CDN processing timed out due to slow connection. Trying server-side processing...';
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('cdn')) {
      return 'Unable to connect to PDF processing service. Trying server-side processing...';
    }
    
    if (message.includes('worker')) {
      return 'CDN PDF worker failed to load. Trying server-side processing...';
    }
    
    if (message.includes('corrupted') || message.includes('invalid')) {
      return 'PDF file appears to be corrupted. Trying server-side processing...';
    }
    
    if (message.includes('no text content')) {
      return 'This PDF appears to be image-based. Trying server-side processing with OCR...';
    }
    
    if (message.includes('memory') || message.includes('size')) {
      return 'PDF file is too large for browser processing. Trying server-side processing...';
    }
    
    return 'CDN PDF processing failed. Trying server-side processing...';
  }

  /**
   * Set custom CDN worker URL
   */
  setCDNWorkerUrl(url: string): void {
    this.cdnWorkerUrl = url;
  }

  /**
   * Get current CDN worker URL
   */
  getCDNWorkerUrl(): string {
    return this.cdnWorkerUrl;
  }

  /**
   * Set timeout for processing
   */
  setTimeout(timeoutMs: number): void {
    this.timeout = timeoutMs;
  }

  /**
   * Set maximum retry attempts
   */
  setMaxRetries(retries: number): void {
    this.maxRetries = Math.max(1, retries);
  }
}