/**
 * CSV validation utilities
 * Validates CSV structure and required columns
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_COLUMNS = ['firstname', 'phone', 'notes'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate CSV file before parsing
 */
export function validateFile(file: File): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file type
  const validExtensions = ['.csv', '.xlsx', '.xls'];
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  
  if (!validExtensions.includes(fileExtension)) {
    errors.push(`Invalid file type. Accepted formats: ${validExtensions.join(', ')}`);
  }

  // For Excel files, add a warning
  if (fileExtension === '.xlsx' || fileExtension === '.xls') {
    warnings.push('Excel files require server-side parsing. Upload will proceed but parsing happens on backend.');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate CSV headers against required columns
 */
export function validateHeaders(headers: string[]): ValidationResult {
  const errors: string[] = [];
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

  // Check if all required columns are present
  const missingColumns = REQUIRED_COLUMNS.filter(
    col => !normalizedHeaders.includes(col)
  );

  if (missingColumns.length > 0) {
    errors.push(
      `Missing required columns: ${missingColumns.join(', ')}. ` +
      `Required: FirstName, Phone, Notes (case-insensitive)`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
  };
}

/**
 * Normalize CSV row to standard format
 */
export function normalizeRow(row: Record<string, string>): {
  firstName: string;
  phone: string;
  notes: string;
} | null {
  // Find columns case-insensitively
  const entries = Object.entries(row);
  
  const firstName = entries.find(([key]) => 
    key.toLowerCase().trim() === 'firstname'
  )?.[1] || '';
  
  const phone = entries.find(([key]) => 
    key.toLowerCase().trim() === 'phone'
  )?.[1] || '';
  
  const notes = entries.find(([key]) => 
    key.toLowerCase().trim() === 'notes'
  )?.[1] || '';

  // Skip empty rows
  if (!firstName && !phone && !notes) {
    return null;
  }

  return { firstName, phone, notes };
}
