// Types partagés pour l'API

export interface Location {
  id: number;
  nom: string;
  adresse: string;
  code_postal: string;
  ville: string;
  type: string;
  niveau: string | null;
  telephone: string | null;
  contact: string | null;
  email: string | null;
  commentaire: string | null;
  lat: number | null;
  lon: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface LocationInput {
  nom: string;
  adresse: string;
  code_postal: string;
  ville: string;
  type: string;
  niveau?: string | null;
  telephone?: string | null;
  contact?: string | null;
  email?: string | null;
  commentaire?: string | null;
  lat?: number | null;
  lon?: number | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
