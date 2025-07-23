"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Image from "next/image";

interface DocumentImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  lawyerName: string;
  isProfilePicture?: boolean;
}

export function DocumentImageModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  lawyerName,
  isProfilePicture = false,
}: DocumentImageModalProps) {
  const handleDownload = () => {
    window.open(imageUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Abogado: {lawyerName}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title="Descargar imagen"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <div className={`relative w-full bg-gray-50 rounded-lg overflow-hidden ${
            isProfilePicture ? 'h-[50vh]' : 'h-[60vh]'
          }`}>
            <Image
              src={imageUrl}
              alt={title}
              fill
              className={isProfilePicture ? "object-cover" : "object-contain"}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="flex items-center justify-center h-full text-muted-foreground">
                      <div class="text-center">
                        <p>Error al cargar la imagen</p>
                        <p class="text-sm">Verifique que la URL sea válida</p>
                      </div>
                    </div>
                  `;
                }
              }}
            />
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
