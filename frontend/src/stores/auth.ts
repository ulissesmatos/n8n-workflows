import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '@utils/api';
import type { AdminUser, LoginRequest } from '@app-types';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AdminUser | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!user.value);
  const isLoading = computed(() => loading.value);

  // Actions
  async function login(credentials: LoginRequest) {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiClient.login(credentials);
      user.value = response.data.admin;

      return true;
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Login failed';
      console.error('Login error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    apiClient.logout();
    user.value = null;
    error.value = null;
  }

  function checkAuth() {
    // Check if token exists and user is set
    return isAuthenticated.value && apiClient.isAuthenticated();
  }

  return {
    // State
    user,
    loading,
    error,

    // Computed
    isAuthenticated,
    isLoading,

    // Actions
    login,
    logout,
    checkAuth,
  };
});

