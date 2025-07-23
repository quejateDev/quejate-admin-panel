"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { LawyersResponse } from "@/types/lawyer.types";


export function useLawyers(page: number = 1, limit: number = 10) {
  const [data, setData] = useState<LawyersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLawyers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/lawyers?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch lawyers");
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error fetching lawyers";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, toast]);

  const verifyLawyer = async (lawyerId: string, isVerified: boolean) => {
    try {
      const response = await fetch("/api/lawyers/verify", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lawyerId, isVerified }),
      });

      if (!response.ok) {
        throw new Error("Failed to update lawyer verification");
      }

      const result = await response.json();

      if (data) {
        const updatedLawyers = data.data.map((lawyer) =>
          lawyer.id === lawyerId ? { ...lawyer, isVerified } : lawyer
        );
        setData({ ...data, data: updatedLawyers });
      }

      toast({
        title: "Success",
        description: `Lawyer ${isVerified ? "verified" : "unverified"} successfully`,
        variant: "default",
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error updating verification";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, [fetchLawyers]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchLawyers,
    verifyLawyer,
  };
}
