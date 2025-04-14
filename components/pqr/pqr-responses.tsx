"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import useAuthStore from "@/store/useAuthStore";
import { toast } from "@/hooks/use-toast";

interface PQRResponse {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface PQRResponsesProps {
  pqrId: string;
  initialResponses: PQRResponse[];
}

export function PQRResponses({ pqrId, initialResponses }: PQRResponsesProps) {
  const [responses, setResponses] = useState<PQRResponse[]>(initialResponses);
  const [newResponse, setNewResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponse.trim()) return;

    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para responder",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/pqr/${pqrId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newResponse,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit response");
      }

      const newComment = await response.json();
      setResponses((prev) => [...prev, newComment]);
      setNewResponse("");
      toast({
        title: "Éxito",
        description: "Tu respuesta ha sido enviada",
        variant: "default",
      });
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Respuestas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Escribe tu respuesta..."
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar respuesta"}
          </Button>
        </form>

        <div className="space-y-4">
          {responses.map((response) => (
            <div key={response.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={`https://ui-avatars.com/api/?name=${response.user.firstName}+${response.user.lastName}`} />
                <AvatarFallback>
                  {response.user.firstName[0]}
                  {response.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {response.user.firstName} {response.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(response.createdAt, "PPP", { locale: es })}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {response.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 