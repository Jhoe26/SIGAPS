import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  badge?: string;
  children: ReactNode;
}

export function ChartCard({ title, badge, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {badge && (
          <Badge variant="secondary" className="font-normal">
            {badge}
          </Badge>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
