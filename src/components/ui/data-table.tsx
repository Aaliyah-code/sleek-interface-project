import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  cardRender?: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  cardRender,
  keyExtractor,
  onRowClick,
}: DataTableProps<T>) {
  const isMobile = useIsMobile();

  if (isMobile && cardRender) {
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div
            key={keyExtractor(item)}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {cardRender(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(
                  "font-semibold text-foreground bg-muted/50",
                  column.className
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {columns.map((column) => (
                <TableCell key={String(column.key)} className={column.className}>
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
