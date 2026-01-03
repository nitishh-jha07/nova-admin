import axios, { AxiosError, AxiosResponse } from 'axios';
import { z } from 'zod';

// Base API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'professor']),
});

// Types
export type UserRole = 'student' | 'professor';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  avatar?: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
const mockStudentUser: User = {
  id: '1',
  email: 'student@example.com',
  name: 'John Student',
  avatar: undefined,
  role: 'student',
};

const mockProfessorUser: User = {
  id: '2',
  email: 'professor@example.com',
  name: 'Dr. Smith',
  avatar: undefined,
  role: 'professor',
};

// Mock documents
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Research Paper on AI',
    description: 'A comprehensive study on artificial intelligence applications',
    fileName: 'ai_research.pdf',
    fileUrl: '/uploads/ai_research.pdf',
    fileType: 'application/pdf',
    fileSize: 2048000,
    uploadedBy: { id: '1', name: 'John Student', email: 'student@example.com' },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Machine Learning Assignment',
    description: 'Completed assignment for ML course',
    fileName: 'ml_assignment.pdf',
    fileUrl: '/uploads/ml_assignment.pdf',
    fileType: 'application/pdf',
    fileSize: 1024000,
    uploadedBy: { id: '1', name: 'John Student', email: 'student@example.com' },
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    title: 'Data Structures Notes',
    description: 'Notes from data structures class',
    fileName: 'ds_notes.docx',
    fileUrl: '/uploads/ds_notes.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 512000,
    uploadedBy: { id: '3', name: 'Jane Doe', email: 'jane@example.com' },
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
  },
];

// Auth service (mock implementation)
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(1000);

    if (credentials.email === 'student@example.com' && credentials.password === 'password123') {
      const token = 'mock_jwt_token_student_' + Date.now();
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(mockStudentUser));
      return { user: mockStudentUser, token };
    }

    if (credentials.email === 'professor@example.com' && credentials.password === 'password123') {
      const token = 'mock_jwt_token_professor_' + Date.now();
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(mockProfessorUser));
      return { user: mockProfessorUser, token };
    }

    throw new Error('Invalid email or password');
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    await delay(1000);

    // Check if email already exists
    if (data.email === 'student@example.com' || data.email === 'professor@example.com') {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: data.role,
    };

    const token = 'mock_jwt_token_' + Date.now();
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(newUser));

    return { user: newUser, token };
  },

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
};

// Document service
export const documentService = {
  async getDocuments(): Promise<Document[]> {
    await delay(600);
    return [...mockDocuments];
  },

  async getMyDocuments(userId: string): Promise<Document[]> {
    await delay(600);
    return mockDocuments.filter(doc => doc.uploadedBy.id === userId);
  },

  async uploadDocument(data: FormData): Promise<Document> {
    await delay(1000);

    const title = data.get('title') as string;
    const description = data.get('description') as string;
    const file = data.get('file') as File;
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    const newDocument: Document = {
      id: Date.now().toString(),
      title,
      description,
      fileName: file?.name || 'document.pdf',
      fileUrl: `/uploads/${file?.name || 'document.pdf'}`,
      fileType: file?.type || 'application/pdf',
      fileSize: file?.size || 0,
      uploadedBy: user ? { id: user.id, name: user.name, email: user.email } : { id: '', name: '', email: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDocuments.unshift(newDocument);
    return newDocument;
  },

  async deleteDocument(id: string): Promise<void> {
    await delay(500);
    const index = mockDocuments.findIndex(doc => doc.id === id);
    if (index > -1) {
      mockDocuments.splice(index, 1);
    }
  },

  async downloadDocument(id: string): Promise<string> {
    await delay(300);
    const doc = mockDocuments.find(d => d.id === id);
    if (!doc) throw new Error('Document not found');
    return doc.fileUrl;
  },
};

export default api;
