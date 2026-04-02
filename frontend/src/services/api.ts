import type { 
  BoardWithListsResponse, 
  BoardResponse, 
  BoardCreate, 
  ListResponse, 
  ListCreate, 
  CardResponse, 
  CardCreate, 
  CardUpdate, 
  CardMove 
} from '../types';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  timeout: 5000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// --- Auth Services ---
export const registerApi = async (data: { email: string; password: string }): Promise<{ user: { id: string; email: string }; access_token: string; token_type: string }> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

export const loginApi = async (data: FormData): Promise<{ access_token: string; token_type: string }> => {
  const response = await apiClient.post('/auth/login', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// --- Board API Services ---
export const getBoardsApi = async (): Promise<BoardResponse[]> => {
  const response = await apiClient.get<BoardResponse[]>('/boards');
  return response.data;
};

export const createBoardApi = async (payload: BoardCreate): Promise<BoardResponse> => {
  const response = await apiClient.post<BoardResponse>('/boards', payload);
  return response.data;
};

export const fetchBoardApi = async (id: string): Promise<BoardWithListsResponse> => {
  const response = await apiClient.get<BoardWithListsResponse>(`/boards/${id}`);
  return response.data;
};

export const deleteBoardApi = async (id: string): Promise<void> => {
  await apiClient.delete(`/boards/${id}`);
};

// --- List API Services ---
export const createListApi = async (boardId: string, payload: ListCreate): Promise<ListResponse> => {
  const response = await apiClient.post<ListResponse>(`/boards/${boardId}/lists`, payload);
  return response.data;
};

export const deleteListApi = async (id: string): Promise<void> => {
  await apiClient.delete(`/lists/${id}`);
};

// --- Card API Services ---
export const createCardApi = async (payload: CardCreate): Promise<CardResponse> => {
  const response = await apiClient.post<CardResponse>('/cards', payload);
  return response.data;
};

export const updateCardApi = async (cardId: string, payload: CardUpdate): Promise<CardResponse> => {
  const response = await apiClient.patch<CardResponse>(`/cards/${cardId}`, payload);
  return response.data;
};

export const deleteCardApi = async (cardId: string): Promise<void> => {
  await apiClient.delete(`/cards/${cardId}`);
};

export const moveCardApi = async (cardId: string, payload: CardMove): Promise<CardResponse> => {
  const response = await apiClient.patch<CardResponse>(`/cards/${cardId}/move`, payload);
  return response.data;
};
