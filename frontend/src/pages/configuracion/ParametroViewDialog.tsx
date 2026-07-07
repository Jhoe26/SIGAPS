import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useParametro } from "@/hooks/useParametro";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  clave: string | null;
}

export function ParametroViewDialog({ open, onOpenChange, titulo, clave }: Props) {
  const { data, isLoading, isError } = useParametro(clave ?? "", open && !!clave);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>
        {!clave || isError ? (
          <p className="text-sm text-muted-foreground">
            Este parámetro aún no tiene un valor configurado en el sistema.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Valor actual</dt>
              <dd className="text-lg font-semibold text-foreground">{data?.valor}</dd>
            </div>
            {data?.descripcion && (
              <div>
                <dt className="text-muted-foreground">Descripción</dt>
                <dd className="text-foreground">{data.descripcion}</dd>
              </div>
            )}
          </dl>
        )}
      </DialogContent>
    </Dialog>
  );
}
