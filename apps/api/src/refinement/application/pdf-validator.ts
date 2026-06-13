export const MAX_PDF_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function validatePdfFile(file?: Express.Multer.File): void {
  if (!file) {
    throw new Error('File is required');
  }

  if (file.mimetype !== 'application/pdf') {
    throw new Error('Only PDF files are supported');
  }

  if (file.size <= 0) {
    throw new Error('PDF file must not be empty');
  }

  if (file.size > MAX_PDF_FILE_SIZE_BYTES) {
    throw new Error('File exceeds maximum size of 10MB');
  }
}
