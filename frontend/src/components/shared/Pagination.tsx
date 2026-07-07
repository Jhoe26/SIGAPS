import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onChange(Math.max(0, page - 1))}>
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {page + 1} de {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>
        Siguiente
      </Button>
    </div>
  );
}
