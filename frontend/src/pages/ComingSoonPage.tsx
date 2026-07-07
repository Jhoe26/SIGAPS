import { Construction } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
}

export default function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card text-center">
      <div className="rounded-full bg-secondary p-4">
        <Construction className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Este módulo está en construcción y estará disponible próximamente.
      </p>
    </div>
  );
}
