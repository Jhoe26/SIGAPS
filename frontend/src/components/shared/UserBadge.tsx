import type { UsuarioAuth } from "@/types/auth";
import type { UsuarioResumen } from "@/types/usuario";

interface UserBadgeProps {
  usuario: UsuarioAuth | UsuarioResumen;
  className?: string;
}

/**
 * Formato de visualización obligatorio para cualquier "registrado por":
 * {titulo} {nombreCompleto} — DNI {dni} | CEP {colegiatura}
 */
export function UserBadge({ usuario, className }: UserBadgeProps) {
  const titulo = usuario.titulo ? `${usuario.titulo} ` : "";
  const cep = usuario.colegiatura ? ` | CEP ${usuario.colegiatura}` : "";

  return (
    <span className={className}>
      {titulo}
      {usuario.nombreCompleto} — DNI {usuario.dni}
      {cep}
    </span>
  );
}
