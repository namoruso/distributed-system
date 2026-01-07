import { defineStore } from 'pinia';
import * as authAPI from '../api/auth-api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
    error: null,
    pendingVerification: null
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    userRole: (state) => state.isAdmin ? 'admin' : 'customer',
    userName: (state) => state.user?.nombre || state.user?.name || 'User'
  },

  actions: {
    initAuth() {
      const token = localStorage.getItem('jwt_token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
        this.isAdmin = this.user.rol === 'admin' || this.user.correo?.includes('admin');
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authAPI.register(userData);

        this.pendingVerification = userData.email;
        
        this.loading = false;
        return response;
      } catch (error) {
        this.error = error.message || 'Registration failed';
        this.loading = false;
        throw error;
      }
    },

    async verifyEmail(email, code) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authAPI.verifyEmail(email, code);
        this.pendingVerification = null;
        this.loading = false;
        return response;
      } catch (error) {
        this.error = error.message || 'Verification failed';
        this.loading = false;
        throw error;
      }
    },

    async login(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authAPI.login(email, password);

        this.token = response.access_token || response.token;
        localStorage.setItem('jwt_token', this.token);

        const userInfo = await authAPI.getCurrentUser(this.token);
        this.user = userInfo;

        this.isAdmin = email.includes('admin') || userInfo.rol === 'admin';

        localStorage.setItem('user', JSON.stringify(this.user));
        
        this.isAuthenticated = true;
        this.loading = false;
        
        return response;
      } catch (error) {
        this.error = error.message || 'Login failed';
        this.loading = false;
        throw error;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.isAdmin = false;
      this.error = null;
      
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
    },

    async fetchCurrentUser() {
      if (!this.token) return;
      
      this.loading = true;
      try {
        const userInfo = await authAPI.getCurrentUser(this.token);
        this.user = userInfo;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.loading = false;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        if (error.status === 401) {
          this.logout();
        }
      }
    },

    clearError() {
      this.error = null;
    }
  }
});
