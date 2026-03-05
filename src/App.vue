<template>
  <router-view />
  <!-- Global Toast Notifications -->
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast-item', `toast-${toast.type}`]"
    >
      <span class="toast-icon">{{ iconMap[toast.type] }}</span>
      <span class="toast-message">{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toasts } from '@/utils/toast'

const iconMap: Record<string, string> = {
  error: '❌',
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️',
}
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 22px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  color: #fff;
  animation: toast-in 0.3s ease;
  max-width: 400px;
  word-break: break-word;
}

.toast-error {
  background: #ef4444;
}

.toast-success {
  background: #10b981;
}

.toast-warning {
  background: #f59e0b;
}

.toast-info {
  background: #3b82f6;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
