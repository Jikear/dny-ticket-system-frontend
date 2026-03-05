import { reactive } from 'vue'

export interface ToastItem {
  id: number
  message: string
  type: 'error' | 'success' | 'warning' | 'info'
}

let nextId = 0

export const toasts = reactive<ToastItem[]>([])

function addToast(message: string, type: ToastItem['type'] = 'error', duration = 4000) {
  const id = nextId++
  toasts.push({ id, message, type })
  setTimeout(() => {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx !== -1) toasts.splice(idx, 1)
  }, duration)
}

export function showError(message: string) {
  addToast(message, 'error')
}

export function showSuccess(message: string) {
  addToast(message, 'success')
}

export function showWarning(message: string) {
  addToast(message, 'warning')
}

export function showInfo(message: string) {
  addToast(message, 'info')
}
