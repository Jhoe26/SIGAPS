import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import type { ApiResponse, Page } from "@/types/api";
import type { Paciente } from "@/types/paciente";

interface PatientSearchProps {
  onSelect: (paciente: Paciente) => void;
  placeholder?: string;
}

/**
 * Buscador reutilizable de pacientes por DNI o apellidos. Usado por los formularios
 * de todos los módulos clínicos para seleccionar el paciente antes de registrar.
 */
export function PatientSearch({ onSelect, placeholder }: PatientSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: ["pacientes", "search", query],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Page<Paciente>>>("/pacientes", {
        params: { search: query, page: 0, size: 8 },
      });
      return data.data.content;
    },
    enabled: query.trim().length >= 2,
  });

  return (
    <div className="relative">
      <Input
        placeholder={placeholder ?? "Buscar por DNI o apellidos..."}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-white shadow-md">
          {isFetching && <p className="p-2 text-sm text-muted-foreground">Buscando...</p>}
          {!isFetching && data?.length === 0 && (
            <p className="p-2 text-sm text-muted-foreground">Sin resultados</p>
          )}
          {data?.map((paciente) => (
            <button
              key={paciente.id}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
              onClick={() => {
                onSelect(paciente);
                setQuery(`${paciente.nombreCompleto} — DNI ${paciente.dni}`);
                setOpen(false);
              }}
            >
              {paciente.nombreCompleto} — DNI {paciente.dni}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
