"use client";

import { getUserService, updateUserService } from "@/services/api/User.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isFollowing: boolean;
  followers: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  }>;
  following: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  }>;
  profilePicture: string | null;
  _count: {
    followers: number;
    following: number;
    PQRS: number;
  };
}

export default function useUser(id: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserService(id),
  });

  const { mutate: updateUser } = useMutation({
    mutationFn: (user: Partial<UserProfile>) => updateUserService(id, user),
    onMutate: async (user: Partial<UserProfile>) => {
      await queryClient.cancelQueries({ queryKey: ["user", id] });
      const previousUser = queryClient.getQueryData<UserProfile>(["user", id]);
      queryClient.setQueryData(["user", id], user);
      return { previousUser };
    },
    onError: (error, user, context) => {
      queryClient.setQueryData(["user", id], context?.previousUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });

  return {
    data,
    isLoading,
    error,
    updateUser,
  };
}
