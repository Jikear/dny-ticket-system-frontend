import { defineStore } from 'pinia'

interface UserState {
  username: string | null
  role: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role')
  }),
  actions: {
    setUser(username: string, role: string, token: string) {
      this.username = username
      this.role = role
      localStorage.setItem('username', username)
      localStorage.setItem('role', role)
      localStorage.setItem('token', token)
    },
    clearUser() {
      this.username = null
      this.role = null
      localStorage.removeItem('username')
      localStorage.removeItem('role')
      localStorage.removeItem('token')
    }
  }
})