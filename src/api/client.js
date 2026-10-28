/**
 * Modern API Client for Personal Finance Web App
 * Features automatic Bearer token injection and 401 Unauthorized handling
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.tokenKey = 'finance_token';
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Centralized HTTP Request Handler with Interceptors
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Request Interceptor: Attach Authorization Bearer token if present
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Response Interceptor: Handle 401 Unauthorized (session expired or invalid)
      if (response.status === 401) {
        this.clearToken();
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        
        // If not already on auth pages, redirect to login
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Session expired. Please log in again.');
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with HTTP status ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth Endpoints
  async register(username, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Transaction Endpoints
  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/transactions?${query}` : '/transactions';
    return this.request(endpoint);
  }

  async createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard Metrics
  async getDashboardSummary() {
    return this.request('/dashboard/summary');
  }

  // Health
  async getHealth() {
    return this.request('/health');
  }
}

export const api = new ApiClient(BASE_URL);
export default api;
