/**
 * CSV file uploader component with validation
 * Supports .csv files with client-side parsing via papaparse
 * Shows warnings for .xlsx/.xls files (server-side parsing required)
 */

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { validateFile, validateHeaders, normalizeRow } from '@/utils/csvValidator';
import { CSVItem } from '@/utils/distribute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CSVUploaderProps {
  onDataParsed: (data: CSVItem[]) => void;
  onFileSelected?: (file: File) => void;
}

export function CSVUploader({ onDataParsed, onFileSelected }: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setWarnings([]);
    setIsValidated(false);

    // Validate file
    const validation = validateFile(selectedFile);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setWarnings(validation.warnings);
    onFileSelected?.(selectedFile);

    // Auto-parse if it's a CSV file
    if (selectedFile.name.toLowerCase().endsWith('.csv')) {
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    setIsParsing(true);
    
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsParsing(false);

        // Validate headers
        const headerValidation = validateHeaders(results.meta.fields || []);
        
        if (!headerValidation.valid) {
          setErrors(headerValidation.errors);
          return;
        }

        // Normalize and filter rows
        const normalizedData: CSVItem[] = results.data
          .map((row, index) => {
            const normalized = normalizeRow(row);
            return normalized ? { ...normalized, originalRow: index + 2 } : null;
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        if (normalizedData.length === 0) {
          setErrors(['No valid data rows found in CSV file']);
          return;
        }

        setIsValidated(true);
        onDataParsed(normalizedData);
      },
      error: (error) => {
        setIsParsing(false);
        setErrors([`Failed to parse CSV: ${error.message}`]);
      },
    });
  };

  const handleReset = () => {
    setFile(null);
    setErrors([]);
    setWarnings([]);
    setIsValidated(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Upload CSV File
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-file">Select File</Label>
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="flex-1"
            />
            {file && (
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Accepted formats: .csv, .xlsx, .xls (Max 5MB)
          </p>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {warnings.map((warning, i) => (
                <div key={i}>{warning}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errors.map((error, i) => (
                <div key={i}>{error}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Success */}
        {isValidated && !errors.length && (
          <Alert className="border-primary bg-primary/5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              CSV validated successfully! Ready to distribute.
            </AlertDescription>
          </Alert>
        )}

        {/* Parsing indicator */}
        {isParsing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Parsing CSV file...
          </div>
        )}

        {!file && (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Select a CSV file to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
