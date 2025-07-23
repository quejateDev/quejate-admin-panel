export interface Lawyer {
  id: string;
  userId: string;
  documentType: string;
  isVerified: boolean;
  identityDocument: string;
  identityDocumentImage: string | null;
  professionalCardImage: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string | null;
    isActive: boolean;
  };
  createdAt: string;
}

export interface LawyersResponse {
  data: Lawyer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
