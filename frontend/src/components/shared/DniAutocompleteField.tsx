import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import type { Acreditado } from "@/types/acreditado";
import type { ApiResponse } from "@/types/api";

const DEBOUNCE_MS = 400;

async function buscarAcreditado(dni: string): Promise<Acreditado | null> {
  try {
    const { data } = await api.get<ApiResponse<Acreditado>>(`/acreditados/${dni}`);
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

function useDniDebounced(dni: string, delayMs: number): string {
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    if (dni.length !== 8) {
      setDebounced("");
      return;
    }
    const timer = setTimeout(() => setDebounced(dni), delayMs);
    return () => clearTimeout(timer);
  }, [dni, delayMs]);
  return debounced;
}

interface DniAutocompleteFieldProps {
  value: string;
  onChange: (dni: string) => void;
  onAutocomplete: (datos: Acreditado | null) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Campo de DNI reutilizable: al completar 8 dígitos (con debounce de 400ms)
 * consulta el padrón EsSalud y notifica al formulario contenedor los datos
 * encontrados (o null si no está en el padrón / el usuario sigue editando).
 */
export function DniAutocompleteField({ value, onChange, onAutocomplete, disabled, error }: DniAutocompleteFieldProps) {
  const dniDebounced = useDniDebounced(value, DEBOUNCE_MS);
  const ultimoNotificadoRef = useRef<string | null>(null);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["acreditados", dniDebounced],
    queryFn: () => buscarAcreditado(dniDebounced),
    enabled: !disabled && dniDebounced.length === 8,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isError) {
      toast.error("No se pudo consultar el padrón. Verifica tu conexión.");
    }
  }, [isError]);

  useEffect(() => {
    if (dniDebounced.length === 8 && data !== undefined && ultimoNotificadoRef.current !== dniDebounced) {
      ultimoNotificadoRef.current = dniDebounced;
      onAutocomplete(data);
    }
  }, [data, dniDebounced, onAutocomplete]);

  const handleChange = (nuevoDni: string) => {
    if (nuevoDni !== value && ultimoNotificadoRef.current !== null) {
      ultimoNotificadoRef.current = null;
      onAutocomplete(null);
    }
    onChange(nuevoDni);
  };

  const buscando = disabled ? false : value.length === 8 && (dniDebounced !== value || isFetching);
  const encontrado = !buscando && dniDebounced === value && data != null;
  const noEncontrado = !buscando && dniDebounced === value && data === null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Input
          id="dni"
          maxLength={8}
          inputMode="numeric"
          disabled={disabled}
          value={value}
          onChange={(e) => handleChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
        />
        {buscando && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
      </div>
      {buscando && <p className="text-xs text-muted-foreground">Buscando en padrón EsSalud...</p>}
      {encontrado && (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          ✓ Asegurado EsSalud
        </span>
      )}
      {noEncontrado && (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          ⚠ No asegurado en padrón
        </span>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
