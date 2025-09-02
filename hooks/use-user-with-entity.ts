import { useState, useEffect } from 'react';
import { useCurrentUser } from './use-current-user';

interface UserWithEntity {
  id: string;
  email: string;
  name: string;
  Entity: {
    id: string;
    name: string;
  } | null;
  role: string;
}

export const useUserWithEntity = () => {
  const currentUser = useCurrentUser();
  const [userWithEntity, setUserWithEntity] = useState<UserWithEntity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserWithEntity = async () => {
      if (!currentUser?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/${currentUser.id}/entity`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUserWithEntity(userData);
      } catch (err) {
        console.error('Error fetching user with entity:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserWithEntity();
  }, [currentUser?.id]);

  return {
    userWithEntity,
    isLoading,
    error,
    refetch: () => {
      if (currentUser?.id) {
        setUserWithEntity(null);
        setIsLoading(true);
        setError(null);
      }
    }
  };
};
