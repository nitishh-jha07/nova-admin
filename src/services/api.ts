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
  rollNumber: z.string().optional(),
  branch: z.string().optional(),
  year: z.string().optional(),
});

// Types
export type UserRole = 'student' | 'professor';
export type DocumentStatus = 'submitted' | 'approved' | 'rejected';
export type DocumentType = 'assignment' | 'notes' | 'project' | 'thesis' | 'other';

export const SUBJECTS = [
  'Data Structures',
  'Algorithms',
  'Machine Learning',
  'Database Management',
  'Computer Networks',
  'Operating Systems',
  'Web Development',
  'Software Engineering',
] as const;

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const;
export const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'] as const;

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  rollNumber?: string;
  branch?: string;
  year?: string;
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
  rollNumber?: string;
  branch?: string;
  year?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Notification {
  id: string;
  type: 'approval' | 'rejection' | 'new_document' | 'comment';
  message: string;
  documentId?: string;
  documentTitle?: string;
  createdAt: string;
  read: boolean;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  subject: string;
  documentType: DocumentType;
  year: string;
  branch: string;
  status: DocumentStatus;
  professorComment?: string;
  reviewedBy?: {
    id: string;
    name: string;
  };
  reviewedAt?: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
    rollNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUploadData {
  file: File;
  title: string;
  description: string;
  subject: string;
  documentType: DocumentType;
  year: string;
  branch: string;
}

export interface Analytics {
  totalUploads: number;
  subjectWise: { subject: string; count: number }[];
  studentWise: { studentId: string; studentName: string; count: number }[];
  statusWise: { status: DocumentStatus; count: number }[];
  recentUploads: number;
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
  rollNumber: 'CS2021001',
  branch: 'Computer Science',
  year: '3rd Year',
};

const mockProfessorUser: User = {
  id: '2',
  email: 'professor@example.com',
  name: 'Dr. Smith',
  avatar: undefined,
  role: 'professor',
};

// Mock notifications
let mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'approval',
    message: 'Your document "Research Paper on AI" has been approved by Dr. Smith',
    documentId: '1',
    documentTitle: 'Research Paper on AI',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'new_document',
    message: 'New document uploaded: Machine Learning Assignment',
    documentId: '2',
    documentTitle: 'Machine Learning Assignment',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

// Mock documents
let mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Research Paper on AI',
    description: 'A comprehensive study on artificial intelligence applications',
    fileName: 'ai_research.pdf',
    fileUrl: '/uploads/ai_research.pdf',
    fileType: 'application/pdf',
    fileSize: 2048000,
    subject: 'Machine Learning',
    documentType: 'project',
    year: '3rd Year',
    branch: 'Computer Science',
    status: 'approved',
    professorComment: 'Excellent work! Well researched.',
    reviewedBy: { id: '2', name: 'Dr. Smith' },
    reviewedAt: '2024-01-16T10:00:00Z',
    uploadedBy: { id: '1', name: 'John Student', email: 'student@example.com', rollNumber: 'CS2021001' },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '2',
    title: 'Machine Learning Assignment',
    description: 'Completed assignment for ML course - Neural Networks chapter',
    fileName: 'ml_assignment.pdf',
    fileUrl: '/uploads/ml_assignment.pdf',
    fileType: 'application/pdf',
    fileSize: 1024000,
    subject: 'Machine Learning',
    documentType: 'assignment',
    year: '3rd Year',
    branch: 'Computer Science',
    status: 'submitted',
    uploadedBy: { id: '1', name: 'John Student', email: 'student@example.com', rollNumber: 'CS2021001' },
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    title: 'Data Structures Notes',
    description: 'Complete notes from data structures class - Trees and Graphs',
    fileName: 'ds_notes.docx',
    fileUrl: '/uploads/ds_notes.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 512000,
    subject: 'Data Structures',
    documentType: 'notes',
    year: '2nd Year',
    branch: 'Information Technology',
    status: 'rejected',
    professorComment: 'Please include more examples and diagrams.',
    reviewedBy: { id: '2', name: 'Dr. Smith' },
    reviewedAt: '2024-01-14T16:00:00Z',
    uploadedBy: { id: '3', name: 'Jane Doe', email: 'jane@example.com', rollNumber: 'IT2022015' },
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
  },
  {
    id: '4',
    title: 'Database Design Project',
    description: 'Final project for DBMS course - E-commerce database design',
    fileName: 'dbms_project.pdf',
    fileUrl: '/uploads/dbms_project.pdf',
    fileType: 'application/pdf',
    fileSize: 3072000,
    subject: 'Database Management',
    documentType: 'project',
    year: '3rd Year',
    branch: 'Computer Science',
    status: 'submitted',
    uploadedBy: { id: '4', name: 'Mike Johnson', email: 'mike@example.com', rollNumber: 'CS2021045' },
    createdAt: '2024-01-12T11:45:00Z',
    updatedAt: '2024-01-12T11:45:00Z',
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

    if (data.email === 'student@example.com' || data.email === 'professor@example.com') {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: data.role,
      rollNumber: data.rollNumber,
      branch: data.branch,
      year: data.year,
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

  async updateProfile(data: Partial<User>): Promise<User> {
    await delay(500);
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Not authenticated');
    
    const user = JSON.parse(userStr);
    const updatedUser = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
};

// Notification service
export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    await delay(300);
    const userStr = localStorage.getItem('user');
    if (!userStr) return [];
    return [...mockNotifications];
  },

  async markAsRead(id: string): Promise<void> {
    await delay(200);
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  },

  async markAllAsRead(): Promise<void> {
    await delay(200);
    mockNotifications = mockNotifications.map(n => ({ ...n, read: true }));
  },

  async getUnreadCount(): Promise<number> {
    await delay(100);
    return mockNotifications.filter(n => !n.read).length;
  },
};

// Document service
export const documentService = {
  async getDocuments(filters?: {
    subject?: string;
    year?: string;
    studentId?: string;
    status?: DocumentStatus;
  }): Promise<Document[]> {
    await delay(600);
    let filtered = [...mockDocuments];

    if (filters?.subject) {
      filtered = filtered.filter(d => d.subject === filters.subject);
    }
    if (filters?.year) {
      filtered = filtered.filter(d => d.year === filters.year);
    }
    if (filters?.studentId) {
      filtered = filtered.filter(d => d.uploadedBy.id === filters.studentId);
    }
    if (filters?.status) {
      filtered = filtered.filter(d => d.status === filters.status);
    }

    return filtered;
  },

  async getMyDocuments(userId: string): Promise<Document[]> {
    await delay(600);
    return mockDocuments.filter(doc => doc.uploadedBy.id === userId);
  },

  async uploadDocument(data: FormData): Promise<Document> {
    await delay(1000);

    const title = data.get('title') as string;
    const description = data.get('description') as string;
    const subject = data.get('subject') as string;
    const documentType = data.get('documentType') as DocumentType;
    const year = data.get('year') as string;
    const branch = data.get('branch') as string;
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
      subject,
      documentType,
      year,
      branch,
      status: 'submitted',
      uploadedBy: user 
        ? { id: user.id, name: user.name, email: user.email, rollNumber: user.rollNumber } 
        : { id: '', name: '', email: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDocuments.unshift(newDocument);
    return newDocument;
  },

  async approveDocument(id: string, comment?: string): Promise<Document> {
    await delay(500);
    const doc = mockDocuments.find(d => d.id === id);
    if (!doc) throw new Error('Document not found');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    doc.status = 'approved';
    doc.professorComment = comment;
    doc.reviewedBy = user ? { id: user.id, name: user.name } : undefined;
    doc.reviewedAt = new Date().toISOString();
    doc.updatedAt = new Date().toISOString();

    // Add notification for student
    mockNotifications.unshift({
      id: Date.now().toString(),
      type: 'approval',
      message: `Your document "${doc.title}" has been approved`,
      documentId: doc.id,
      documentTitle: doc.title,
      createdAt: new Date().toISOString(),
      read: false,
    });

    return doc;
  },

  async rejectDocument(id: string, comment: string): Promise<Document> {
    await delay(500);
    const doc = mockDocuments.find(d => d.id === id);
    if (!doc) throw new Error('Document not found');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    doc.status = 'rejected';
    doc.professorComment = comment;
    doc.reviewedBy = user ? { id: user.id, name: user.name } : undefined;
    doc.reviewedAt = new Date().toISOString();
    doc.updatedAt = new Date().toISOString();

    // Add notification for student
    mockNotifications.unshift({
      id: Date.now().toString(),
      type: 'rejection',
      message: `Your document "${doc.title}" was rejected: ${comment}`,
      documentId: doc.id,
      documentTitle: doc.title,
      createdAt: new Date().toISOString(),
      read: false,
    });

    return doc;
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

  async getAnalytics(): Promise<Analytics> {
    await delay(500);
    
    const subjectCounts: Record<string, number> = {};
    const studentCounts: Record<string, { name: string; count: number }> = {};
    const statusCounts: Record<DocumentStatus, number> = { submitted: 0, approved: 0, rejected: 0 };

    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    let recentUploads = 0;

    mockDocuments.forEach(doc => {
      // Subject wise
      subjectCounts[doc.subject] = (subjectCounts[doc.subject] || 0) + 1;

      // Student wise
      if (!studentCounts[doc.uploadedBy.id]) {
        studentCounts[doc.uploadedBy.id] = { name: doc.uploadedBy.name, count: 0 };
      }
      studentCounts[doc.uploadedBy.id].count++;

      // Status wise
      statusCounts[doc.status]++;

      // Recent uploads
      if (new Date(doc.createdAt) >= monthAgo) {
        recentUploads++;
      }
    });

    return {
      totalUploads: mockDocuments.length,
      subjectWise: Object.entries(subjectCounts).map(([subject, count]) => ({ subject, count })),
      studentWise: Object.entries(studentCounts).map(([studentId, data]) => ({
        studentId,
        studentName: data.name,
        count: data.count,
      })),
      statusWise: Object.entries(statusCounts).map(([status, count]) => ({
        status: status as DocumentStatus,
        count,
      })),
      recentUploads,
    };
  },
};

export default api;
