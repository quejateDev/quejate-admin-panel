"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";
import { DocumentImageModal } from "@/components/DocumentImageModal";

import { Lawyer } from "@/types/lawyer.types";
import { DocumentTypeMapping } from "@/types/document-types";

interface LawyersTableProps {
  lawyers: Lawyer[];
  onVerify: (lawyerId: string, isVerified: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function LawyersTable({ lawyers, onVerify, isLoading = false }: LawyersTableProps) {
  const [loadingVerification, setLoadingVerification] = React.useState<string | null>(null);
  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    lawyerName: string;
    isProfilePicture: boolean;
  }>({
    isOpen: false,
    imageUrl: "",
    title: "",
    lawyerName: "",
    isProfilePicture: false,
  });

  const handleVerification = async (lawyerId: string, isVerified: boolean) => {
    try {
      setLoadingVerification(lawyerId);
      await onVerify(lawyerId, isVerified);
    } finally {
      setLoadingVerification(null);
    }
  };

  const getUserInitials = (name: string) => {
    return `${name.charAt(0)}`.toUpperCase();
  };

  const openImageModal = (imageUrl: string, title: string, lawyerName: string, isProfilePicture = false) => {
    setModalState({
      isOpen: true,
      imageUrl,
      title,
      lawyerName,
      isProfilePicture,
    });
  };

  const closeImageModal = () => {
    setModalState({
      isOpen: false,
      imageUrl: "",
      title: "",
      lawyerName: "",
      isProfilePicture: false,
    });
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Cargando abogados...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Abogados Registrados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Abogado</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Documento de Identidad</TableHead>
                <TableHead>Tarjeta Profesional</TableHead>
                <TableHead>Verificación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lawyers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay abogados registrados
                  </TableCell>
                </TableRow>
              ) : (
                lawyers.map((lawyer) => (
                  <TableRow key={lawyer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className={`${lawyer.user.image ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
                          onClick={() => lawyer.user.image && openImageModal(
                            lawyer.user.image,
                            "Foto de Perfil",
                            `${lawyer.user.name}`,
                            true
                          )}
                          title={lawyer.user.image ? "Clic para ver foto de perfil ampliada" : ""}
                        >
                          <Avatar className={`h-10 w-10 ${lawyer.user.image ? 'hover:scale-105 transition-transform' : ''}`}>
                            <AvatarImage 
                              src={lawyer.user.image || undefined} 
                              alt={`${lawyer.user.name}`}
                            />
                            <AvatarFallback>
                              {getUserInitials(lawyer.user.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <div className="font-medium">
                            {lawyer.user.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {DocumentTypeMapping[lawyer.documentType as keyof typeof DocumentTypeMapping].label}
                        </div>
                        <div className="text-sm text-muted-foreground">{lawyer.identityDocument}</div>
                      </div>
                    </TableCell>
                    <TableCell>{lawyer.user.email}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        {lawyer.identityDocumentImage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openImageModal(
                              lawyer.identityDocumentImage!,
                              "Documento de Identidad",
                              `${lawyer.user.name}`
                            )}
                            className="h-8 w-8 p-0"
                            title="Ver documento de identidad"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        
                      </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex justify-center">
                          {lawyer.professionalCardImage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openImageModal(
                              lawyer.professionalCardImage!,
                              "Tarjeta Profesional",
                              `${lawyer.user.name}`
                            )}
                            className="h-8 w-8 p-0"
                            title="Ver tarjeta profesional"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lawyer.isVerified ? "success" : "warning"}>
                        {lawyer.isVerified ? "Verificado" : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!lawyer.isVerified && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleVerification(lawyer.id, true)}
                            disabled={loadingVerification === lawyer.id}
                            className="h-8"
                          >
                            {loadingVerification === lawyer.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Verificar
                          </Button>
                        )}
                        {lawyer.isVerified && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleVerification(lawyer.id, false)}
                            disabled={loadingVerification === lawyer.id}
                            className="h-8"
                          >
                            {loadingVerification === lawyer.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Rechazar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <DocumentImageModal
        isOpen={modalState.isOpen}
        onClose={closeImageModal}
        imageUrl={modalState.imageUrl}
        title={modalState.title}
        lawyerName={modalState.lawyerName}
        isProfilePicture={modalState.isProfilePicture}
      />
    </Card>
  );
}
