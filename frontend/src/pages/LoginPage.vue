<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p>Login to your AudioHub account</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ error: errors.email }"
              placeholder="your@email.com"
              required
            />
            <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="••••••••"
              required
            />
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>

          <div class="alert alert-error" v-if="authStore.error">
            {{ authStore.error }}
          </div>

          <button type="submit" class="btn btn-primary btn-lg" :disabled="authStore.loading" style="width: 100%;">
            <LoadingSpinner v-if="authStore.loading" message="" />
            <span v-else>Login</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <router-link to="/register">Register here</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth-store';
import { useToast } from '../composables/useToast';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const form = reactive({
  email: '',
  password: ''
});

const errors = ref({});

const handleLogin = async () => {
  errors.value = {};
  authStore.clearError();

  try {
    await authStore.login(form.email, form.password);
    
    toast.success(`Welcome back, ${authStore.userName}!`);
    
    setTimeout(() => {
      if (authStore.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }, 100);
  } catch (error) {
    console.error('Login failed:', error);
    const errorMsg = error.message || error.detail || 'Login failed. Please check your credentials.';
    toast.error(errorMsg);
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
}

.auth-container {
  width: 100%;
  max-width: 450px;
}

.auth-card {
  padding: var(--space-8);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.auth-header h1 {
  margin-bottom: var(--space-2);
}

.auth-header p {
  color: var(--color-text-muted);
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth-footer {
  margin-top: var(--space-6);
  text-align: center;
  color: var(--color-text-secondary);
}

.auth-footer a {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}
</style>
