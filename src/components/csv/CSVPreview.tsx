/**
 * Preview table for CSV data before distribution
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CSVItem } from '@/utils/distribute';

interface CSVPreviewProps {
  data: CSVItem[];
  maxRows?: number;
}

export function CSVPreview({ data, maxRows = 10 }: CSVPreviewProps) {
  const previewData = data.slice(0, maxRows);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Data Preview</span>
          <span className="text-sm font-normal text-muted-foreground">
            Showing {previewData.length} of {data.length} rows
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{idx + 1}</TableCell>
                  <TableCell>{item.firstName}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
