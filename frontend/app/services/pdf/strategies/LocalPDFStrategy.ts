import { ParsingStrategy, ProgressCallback } from '../types';

export class LocalPDFStrategy implements ParsingStrategy {
  name = 'Local PDF.js Worker';
  priority = 100; // Highest priority

  private workerPath = '/pdf.worker.js';

  /**
   * Check if local PDF.js worker is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Check if the local worker file exists
      const response = await fetch(this.workerPath, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn('Local PDF.js worker not available:', error);
      return false;
    }
  }

  /**
   * Parse PDF using local PDF.js worker
   */
  async parse(file: File, onProgress?: ProgressCallback): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Dynamic import for pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set up local worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = this.workerPath;
        
        onProgress?.({
          stage: 'parsing',
          progress: 30,
          message: 'Loading PDF with local worker...'
        });

        const reader = new FileReader();
        
        reader.onload = async () => {
          try {
            const arrayBuffer = reader.result as ArrayBuffer;
            
            onProgress?.({
              stage: 'parsing',
              progress: 40,
              message: 'Processing PDF document...'
            });

            const pdf = await pdfjsLib.getDocument({ 
              data: arrayBuffer,
              // Add error handling options
              verbosity: 0, // Reduce console output
              maxImageSize: 1024 * 1024, // 1MB max image size
              disableFontFace: true, // Improve performance
              disableRange: false,
              disableStream: false
            }).promise;
            
            const totalPages = pdf.numPages;
            let fullText = '';
            
            onProgress?.({
              stage: 'extraction',
              progress: 50,
              message: `Extracting text from ${totalPages} pages...`,
              totalPages
            });

            // Extract text from all pages
            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
              try {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                
                // Extract text items and join them
                const pageText = textContent.items
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .map((item: any) => {
                    // Handle different text item types
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
                const progress = 50 + (pageNum / totalPages) * 40;
                onProgress?.({
                  stage: 'extraction',
                  progress: Math.round(progress),
                  message: `Processed page ${pageNum} of ${totalPages}`,
                  currentPage: pageNum,
                  totalPages
                });

                // Clean up page resources
                page.cleanup();
              } catch (pageError) {
                console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
                // Continue with other pages
              }
            }

            // Clean up PDF document
            pdf.destroy();
            
            if (!fullText.trim()) {
              throw new Error('No text content found in PDF. The document may be image-based or corrupted.');
            }

            onProgress?.({
              stage: 'extraction',
              progress: 95,
              message: 'Finalizing text extraction...'
            });

            resolve(fullText.trim());
          } catch (pdfError) {
            reject(new Error(`Failed to process PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read PDF file'));
        };
        
        reader.readAsArrayBuffer(file);
      } catch (importError) {
        reject(new Error(`Failed to load PDF.js library: ${importError instanceof Error ? importError.message : 'Unknown error'}`));
      }
    });
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('worker')) {
      return 'PDF processing worker failed to load. Trying alternative method...';
    }
    
    if (message.includes('corrupted') || message.includes('invalid')) {
      return 'PDF file appears to be corrupted or invalid. Please try a different file or paste text manually.';
    }
    
    if (message.includes('no text content')) {
      return 'This PDF appears to be image-based or scanned. Please try converting it to text or paste your resume manually.';
    }
    
    if (message.includes('memory') || message.includes('size')) {
      return 'PDF file is too large or complex to process. Please try a smaller file or paste text manually.';
    }
    
    if (message.includes('timeout')) {
      return 'PDF processing timed out. Please try a smaller file or paste text manually.';
    }
    
    return 'Failed to process PDF with local method. Trying alternative approach...';
  }

  /**
   * Set custom worker path
   */
  setWorkerPath(path: string): void {
    this.workerPath = path;
  }

  /**
   * Get current worker path
   */
  getWorkerPath(): string {
    return this.workerPath;
  }
}