<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p>Join AudioHub today</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form" v-if="!showVerification">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="John Doe"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input
              v-model="form.passwordConfirm"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <div class="alert alert-error" v-if="authStore.error">
            {{ authStore.error }}
          </div>

          <button type="submit" class="btn btn-primary btn-lg" :disabled="authStore.loading" style="width: 100%;">
            <LoadingSpinner v-if="authStore.loading" message="" />
            <span v-else>Register</span>
          </button>
        </form>

        <div v-else class="verification-section">
          <div class="alert alert-info">
            A verification code has been sent to {{ form.email }}. Check your email (or MailHog at localhost:8025).
          </div>

          <form @submit.prevent="handleVerify" class="auth-form">
            <div class="form-group">
              <label class="form-label">Verification Code</label>
              <input
                v-model="verificationCode"
                type="text"
                class="form-input"
                placeholder="ABC123"
                maxlength="6"
                required
              />
            </div>

            <div class="alert alert-error" v-if="authStore.error">
              {{ authStore.error }}
            </div>

            <button type="submit" class="btn btn-primary btn-lg" :disabled="authStore.loading" style="width: 100%;">
              <LoadingSpinner v-if="authStore.loading" message="" />
              <span v-else>Verify Email</span>
            </button>
          </form>
        </div>

        <div class="auth-footer">
          <p>Already have an account? <router-link to="/login">Login here</router-link></p>
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
const toast = useToast();
const authStore = useAuthStore();

const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: ''
});

const showVerification = ref(false);
const verificationCode = ref('');

const handleRegister = async () => {
  authStore.clearError();

  if (form.password !== form.passwordConfirm) {
    authStore.error = 'Passwords do not match';
    return;
  }

  try {
    await authStore.register(form);
    showVerification.value = true;
    toast.success('Registration successful! Please check your email for the verification code.');
  } catch (error) {
    console.error('Registration failed:', error);
    toast.error(error.message || 'Registration failed. Please try again.');
  }
};

const handleVerify = async () => {
  authStore.clearError();

  try {
    await authStore.verifyEmail(form.email, verificationCode.value);
    toast.success('Email verified successfully! You can now login.');
    router.push('/login');
  } catch (error) {
    console.error('Verification failed:', error);
    toast.error(error.message || 'Verification failed. Please check your code.');
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

.verification-section {
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
