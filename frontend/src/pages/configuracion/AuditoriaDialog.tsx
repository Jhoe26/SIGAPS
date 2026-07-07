import { useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuditoria } from "@/hooks/useAuditoria";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACCION_BADGE: Record<string, string> = {
  INSERT: "bg-emerald-100 text-emerald-700 border-emerald-200",
  UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
};

export function AuditoriaDialog({ open, onOpenChange }: Props) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAuditoria(page);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Registro de auditoría del sistema</DialogTitle>
        </DialogHeader>
        {!isLoading && (data?.content.length ?? 0) === 0 ? (
          <EmptyState mensaje="Aún no hay eventos registrados en la auditoría" />
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tabla</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Cargando...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  data?.content.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">{log.timestamp.replace("T", " ")}</TableCell>
                      <TableCell className="text-sm">{log.tabla}</TableCell>
                      <TableCell className="text-sm">#{log.registroId}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ACCION_BADGE[log.accion]}>
                          {log.accion}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">Usuario #{log.usuarioId}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
        {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}
      </DialogContent>
    </Dialog>
  );
}
