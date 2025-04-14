"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PQRTimeline } from "./pqr-timeline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClockIcon } from "lucide-react";

type PQRSStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface StatusChange {
  id: string;
  status: PQRSStatus;
  createdAt: Date;
  comment?: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface PQRStatusProps {
  pqrId: string;
  initialStatus: PQRSStatus;
}

const statusMap = {
  PENDING: {
    label: "Pendiente",
    variant: "default",
  },
  IN_PROGRESS: {
    label: "En Progreso",
    variant: "secondary",
  },
  RESOLVED: {
    label: "Resuelto",
    variant: "success",
  },
  CLOSED: {
    label: "Cerrado",
    variant: "destructive",
  },
};

export function PQRStatus({ pqrId, initialStatus }: PQRStatusProps) {
  const [status, setStatus] = useState<PQRSStatus>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [comment, setComment] = useState("");
  const [showCommentField, setShowCommentField] = useState(false);
  const [statusHistory, setStatusHistory] = useState<StatusChange[]>([]);

  useEffect(() => {
    fetchStatusHistory();
  }, []);

  const fetchStatusHistory = async () => {
    try {
      const response = await fetch(`/api/pqr/${pqrId}/status`);
      if (!response.ok) throw new Error("Failed to fetch status history");
      const history = await response.json();
      console.log("Status history fetched:", history);
      setStatusHistory(Array.isArray(history) ? history : []);
    } catch (error) {
      console.error("Error fetching status history:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de estados",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: PQRSStatus) => {
    setStatus(newStatus);
    setShowCommentField(true);
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un comentario",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/pqr/${pqrId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, comment }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      const data = await response.json();
      console.log("Status update response:", data);
      
      if (data.history) {
        setStatusHistory((prev) => [data.history, ...prev]);
      }
      
      setShowCommentField(false);
      setComment("");
      toast({
        title: "Éxito",
        description: "Estado actualizado correctamente",
        variant: "default",
      });
      
      fetchStatusHistory();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={statusMap[status].variant as any}>
        {statusMap[status].label}
      </Badge>
      <Select
        value={status}
        onValueChange={(value) => handleStatusChange(value as PQRSStatus)}
        disabled={isUpdating || showCommentField}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Cambiar estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Pendiente</SelectItem>
          <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
          <SelectItem value="RESOLVED">Resuelto</SelectItem>
          <SelectItem value="CLOSED">Cerrado</SelectItem>
        </SelectContent>
      </Select>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <ClockIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historial de Estados</DialogTitle>
          </DialogHeader>
          <PQRTimeline statusHistory={statusHistory} />
        </DialogContent>
      </Dialog>

      {showCommentField && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Agregar comentario</h3>
            <Textarea
              placeholder="Escribe un comentario sobre el cambio de estado..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCommentField(false);
                  setComment("");
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isUpdating}>
                {isUpdating ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 