"use client";

import { getUserService } from "@/services/api/User.service";
import { useState } from "react";

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

export default function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  async function fetchUser(id: string) {
    try {
      const user = await getUserService(id);
      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }
  const clearUser = () => {
    setUser(null);
    setIsLoading(true);
  };

  return {
    fetchUser,
    user,
    setUser,
    isLoading,
    clearUser,
  };
}
