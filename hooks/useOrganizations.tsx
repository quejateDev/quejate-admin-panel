import {
  CreateEntityDTO,
  createOrganizationService,
  getOrganizationsService,
} from "@/services/api/organization.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useOrganizations() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => getOrganizationsService(),
  });

  const { mutate: createOrganization } = useMutation({
    mutationFn: (organization: CreateEntityDTO) =>
      createOrganizationService(organization),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    data,
    isLoading,
    error,
    createOrganization,
  };
}
