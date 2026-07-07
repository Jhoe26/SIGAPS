export type AccionAuditoria = "INSERT" | "UPDATE" | "DELETE";

export interface AuditLog {
  id: number;
  usuarioId: number;
  tabla: string;
  registroId: number;
  accion: AccionAuditoria;
  valoresAntes: string | null;
  valoresDespues: string | null;
  ipOrigen: string | null;
  userAgent: string | null;
  timestamp: string;
}
