/**
 * Frontend API Service for Personal Finance Web App
 * Communicates with the Express backend service
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  getToken() {
    return localStorage.getItem('finance_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('finance_token', token);
    } else {
      localStorage.removeItem('finance_token');
    }
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers),
    };

    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // --- Auth APIs ---
  async register(username, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // --- Transaction APIs ---
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

  async getDashboardSummary() {
    return this.request('/dashboard/summary');
  }

  async checkHealth() {
    return this.request('/health');
  }
}

export const api = new ApiService();
export default api;
