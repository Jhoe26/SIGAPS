import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";

const loginSchema = z.object({
  dni: z.string().min(1, "Ingresa tu correo o DNI"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_35%,#1E3A8A_0%,#0F1729_75%)] px-4 py-8">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-card shadow-lg">
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] px-6 py-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-white/80">MINISTERIO DE SALUD DEL PERÚ</p>
              <p className="text-xl font-bold leading-tight">SIGAPS</p>
            </div>
          </div>
          <p className="mt-4 text-lg font-semibold">Bienvenido</p>
          <p className="text-xs text-white/70">Ingresa tus credenciales para continuar</p>
        </div>

        <div className="px-6 py-6">
          <form className="space-y-4" onSubmit={handleSubmit((values) => login.mutate(values))}>
            <div className="space-y-1.5">
              <Label htmlFor="dni">Correo o DNI</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="dni" className="pl-9" autoComplete="username" {...register("dni")} />
              </div>
              {errors.dni && <p className="text-sm text-destructive">{errors.dni.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  autoComplete="current-password"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => toast.info("Contacta al administrador del sistema para restablecerla")}
                  className="text-xs font-medium text-active hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-active hover:bg-active/90" disabled={login.isPending}>
              {login.isPending ? "Ingresando..." : "Ingresar al sistema ›"}
            </Button>
          </form>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">Sistema oficial · MINSA Perú · v2.4.1</p>
        </div>
      </div>
    </div>
  );
}
