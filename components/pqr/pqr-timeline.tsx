"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StatusChange {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
  };
  comment?: string;
}

const statusMap = {
  PENDING: {
    label: "Pendiente",
    variant: "default",
    icon: "⏳",
  },
  IN_PROGRESS: {
    label: "En Progreso",
    variant: "secondary",
    icon: "🔄",
  },
  RESOLVED: {
    label: "Resuelto",
    variant: "success",
    icon: "✅",
  },
  CLOSED: {
    label: "Cerrado",
    variant: "destructive",
    icon: "🔒",
  },
};

interface PQRTimelineProps {
  statusHistory: StatusChange[];
}

export function PQRTimeline({ statusHistory }: PQRTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Estados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
          {statusHistory.map((change, index) => (
            <div key={change.id} className="relative pl-8">
              <div className="absolute left-2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-muted flex items-center justify-center">
                {statusMap[change.status].icon}
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={statusMap[change.status].variant as any}>
                    {statusMap[change.status].label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(change.createdAt, "PPP 'a las' p", { locale: es })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${change.user.firstName}+${change.user.lastName}`}
                    />
                    <AvatarFallback>
                      {change.user.firstName[0]}
                      {change.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {change.user.firstName} {change.user.lastName}
                  </span>
                </div>
                {change.comment && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {change.comment}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 