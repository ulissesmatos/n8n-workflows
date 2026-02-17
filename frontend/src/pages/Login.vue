<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <h1>Admin Login</h1>
        <p class="login-subtitle">
          Sign in to manage workflows
        </p>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="admin@example.com"
              autocomplete="email"
            >
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="Enter your password"
              autocomplete="current-password"
            >
          </div>

          <div
            v-if="error"
            class="alert alert-error"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            :disabled="loading"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="login-footer">
          <router-link to="/">
            ← Back to home
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';

  try {
    const success = await authStore.login({
      email: email.value,
      password: password.value,
    });

    if (success) {
      router.push('/admin');
    } else {
      error.value = authStore.error || 'Login failed';
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top right, #131313 0%, transparent 34%), #050505;
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: #0b0b0b;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #242424;
  box-shadow: 0 20px 42px rgba(0, 0, 0, 0.35);
}

.login-card h1 {
  margin: 0 0 0.5rem 0;
  color: #f4f4f4;
}

.login-subtitle {
  color: #9e9e9e;
  margin-bottom: 1.6rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.btn-block {
  width: 100%;
  margin-top: 1rem;
}

.login-footer {
  margin-top: 1.6rem;
  color: #8e8e8e;
}

.login-footer a {
  color: #e7e7e7;
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  opacity: 0.8;
}
</style>
