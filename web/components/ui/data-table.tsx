import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { EmptyState } from './empty-state';
import { Spinner } from './spinner';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyTitle = 'No data available',
  emptyDescription = 'There is currently no data to display in this table.',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center rounded-md border">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} className="min-h-[400px]" />
    );
  }

  return (
    <div className="bg-card rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, index) => (
              <TableHead
                key={col.key || index}
                style={{ width: col.width, textAlign: col.align || 'left' }}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((col, colIndex) => (
                <TableCell key={col.key || colIndex} style={{ textAlign: col.align || 'left' }}>
                  {col.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
