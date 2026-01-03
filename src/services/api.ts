import axios, { AxiosError, AxiosResponse } from 'axios';

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

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
const mockUser: User = {
  id: '1',
  email: 'demo@example.com',
  name: 'John Doe',
  avatar: undefined,
  role: 'Admin',
};

// Auth service (mock implementation)
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(1000); // Simulate network delay

    // Mock validation
    if (credentials.email === 'demo@example.com' && credentials.password === 'password123') {
      const token = 'mock_jwt_token_' + Date.now();
      
      // Store based on remember me
      if (credentials.rememberMe) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(mockUser));
      } else {
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('user', JSON.stringify(mockUser));
      }

      return { user: mockUser, token };
    }

    throw new Error('Invalid email or password');
  },

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));
  },
};

// Dashboard stats (mock)
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  growth: number;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  avatar?: string;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    await delay(500);
    return {
      totalUsers: 2847,
      activeUsers: 1523,
      revenue: 45230,
      growth: 12.5,
    };
  },

  async getRecentActivity(): Promise<ActivityItem[]> {
    await delay(600);
    return [
      { id: '1', user: 'Sarah Chen', action: 'created', target: 'New Project Alpha', time: '2 min ago' },
      { id: '2', user: 'Mike Johnson', action: 'updated', target: 'Dashboard Layout', time: '5 min ago' },
      { id: '3', user: 'Emily Davis', action: 'commented on', target: 'Feature Request #42', time: '12 min ago' },
      { id: '4', user: 'Alex Thompson', action: 'completed', target: 'Sprint Review', time: '25 min ago' },
      { id: '5', user: 'Jordan Lee', action: 'deployed', target: 'Production v2.1.0', time: '1 hour ago' },
    ];
  },
};

export default api;
