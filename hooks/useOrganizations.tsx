import { getOrganizationsService } from "@/services/api/organization.service";
import { useQuery } from "@tanstack/react-query";

export default function useOrganizations() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => getOrganizationsService(),
  });

  return {
    data,
    isLoading,
    error,
  };
}
