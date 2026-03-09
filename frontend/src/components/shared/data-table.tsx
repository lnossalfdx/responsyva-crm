import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Column<T> = {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  getRowKey?: (item: T, index: number) => string;
};

export function DataTable<T>({ columns, data, onRowClick, getRowKey }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.24em] text-zinc-500">
              {columns.map((column) => (
                <th key={column.key} className={cn("px-5 py-4 font-medium", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-sm text-zinc-200">
            {data.map((item, index) => (
              <tr
                key={getRowKey ? getRowKey(item, index) : String(index)}
                className={cn(
                  "transition-colors hover:bg-white/4",
                  onRowClick && "cursor-pointer",
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-5 py-4 align-top", column.className)}>
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
