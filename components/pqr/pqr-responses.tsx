"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Response {
  id: string;
  text: string;
  createdAt: Date | string;
  // `null` cuando el autor de la respuesta ya no existe: `EntityResponse.user`
  // es `SetNull`, así que una respuesta oficial sobrevive al borrado de quien
  // la escribió — que es lo correcto para un documento con efectos jurídicos.
  user: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  attachments: Array<{
    id: string;
    url: string;
    name: string;
    [key: string]: any;
  }>;
}

interface PQRResponsesProps {
  pqrId: string;
  initialResponses: Response[];
}

export function PQRResponses({ pqrId, initialResponses }: PQRResponsesProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [responses, setResponses] = useState<Response[]>(initialResponses);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

  // Fetch responses on mount
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setIsLoadingResponses(true);
        const res = await fetch(`/api/pqr/${pqrId}/responses`);
        if (res.ok) {
          const data = await res.json();
          setResponses(data);
        }
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setIsLoadingResponses(false);
      }
    };

    fetchResponses();
  }, [pqrId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      toast({
        title: "Error",
        description: "La respuesta no puede estar vacía",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/pqr/${pqrId}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (res.status === 401) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para responder",
          variant: "destructive",
        });
        return;
      }

      if (res.status === 403) {
        toast({
          title: "Error",
          description: "No tienes permiso para responder a este PQRS",
          variant: "destructive",
        });
        return;
      }

      if (!res.ok) {
        throw new Error("Error creating response");
      }

      const newResponse = await res.json();
      setResponses([newResponse, ...responses]);
      setText("");
      toast({
        title: "Éxito",
        description: "Respuesta enviada correctamente",
      });
    } catch (error) {
      console.error("Error creating response:", error);
      toast({
        title: "Error",
        description: "Error al enviar la respuesta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Response Form */}
      <Card>
        <CardHeader>
          <CardTitle>Responder a esta PQRSD</CardTitle>
          <CardDescription>
            Ingresa la respuesta de la entidad a esta solicitud
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Escribe tu respuesta aquí..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading || !session}
              className="min-h-[120px] border border-muted"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading || !session}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Respuesta
                  </>
                )}
              </Button>
            </div>
            {!session && (
              <p className="text-sm text-muted-foreground">
                Debes iniciar sesión para responder
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Responses List */}
      <Card>
        <CardHeader>
          <CardTitle>Respuestas de la Entidad</CardTitle>
          <CardDescription>
            {responses.length} {responses.length === 1 ? "respuesta" : "respuestas"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingResponses ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : responses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay respuestas aún
            </p>
          ) : (
            <div className="space-y-4">
              {responses.map((response, index) => (
                <div key={response.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={response.user?.image || ""} />
                      <AvatarFallback>
                        {response.user?.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{response.user?.name || "Usuario"}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(response.createdAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                        {response.text}
                      </p>
                      {response.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium">Archivos adjuntos:</p>
                          <div className="space-y-1">
                            {response.attachments.map((attachment) => (
                              <a
                                key={attachment.id}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline block truncate"
                              >
                                {attachment.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 