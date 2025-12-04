<template>
  <div class="loading-spinner">
    <div class="spinner-waveform">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-8);
}

.spinner-waveform {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 40px;
}

.spinner-waveform span {
  width: 6px;
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-accent) 100%);
  border-radius: 3px;
}

.spinner-waveform span:nth-child(1) {
  animation: waveform-bar-1 1s ease-in-out infinite;
}

.spinner-waveform span:nth-child(2) {
  animation: waveform-bar-2 1s ease-in-out infinite;
}

.spinner-waveform span:nth-child(3) {
  animation: waveform-bar-3 1s ease-in-out infinite;
}

.spinner-waveform span:nth-child(4) {
  animation: waveform-bar-4 1s ease-in-out infinite;
}

.spinner-waveform span:nth-child(5) {
  animation: waveform-bar-5 1s ease-in-out infinite;
}

.loading-message {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
