<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header with gradient -->
      <div class="login-header">
        <div class="logo-icon">🎫</div>
        <h2>欢迎回来</h2>
        <p>登录滇南大观园票务系统</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Username field -->
        <div class="form-group">
          <label for="username">
            <span class="label-icon">👤</span>
            用户名
          </label>
          <div class="input-wrapper">
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              required
              :class="{ 'has-value': form.username }"
            />
          </div>
        </div>

        <!-- Password field -->
        <div class="form-group">
          <label for="password">
            <span class="label-icon">🔒</span>
            密码
          </label>
          <div class="input-wrapper password-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              required
              :class="{ 'has-value': form.password }"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              :title="showPassword ? '隐藏密码' : '显示密码'"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <!-- Error message -->
        <transition name="fade">
          <div v-if="error" class="error-message">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>
        </transition>

        <!-- Submit button -->
        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>

      <!-- Footer links -->
      <div class="login-footer">
        <p>
          还没有账号？
          <router-link to="/register" class="link">立即注册</router-link>
        </p>
        <router-link to="/" class="back-link">← 返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginApi } from '@/api/auth'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await loginApi(form)
    // 这里的 res 按我们约定：{ code, message, data: { username, role, token } }

    if (!res || !res.data) {
      throw new Error('登录返回数据为空')
    }

    const { username, role, token } = res.data
    userStore.setUser(username, role, token)
    router.push({ name: 'Home' })
  } catch (e: any) {
    console.error(e)
    // 如果是我们自定义的后端错误结构
    if (e && e.message) {
      error.value = e.message
    } else {
      error.value = '登录失败'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  padding: 20px;
  perspective: 1000px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideUp 0.5s ease-out;
  transform-style: preserve-3d;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) rotateX(-5deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

.login-header {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: #fff;
  padding: 40px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.login-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20%, 20%); }
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.login-header h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.login-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.label-icon {
  font-size: 16px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #10b981;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.input-wrapper input.has-value {
  background: #fff;
}

.input-wrapper input::placeholder {
  color: #aaa;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 50px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 1;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff5f5;
  color: #e53e3e;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  border: 1px solid #fed7d7;
}

.error-icon {
  flex-shrink: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.submit-btn {
  width: 100%;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  padding: 0 30px 30px;
  text-align: center;
}

.login-footer p {
  margin: 0 0 16px;
  color: #666;
  font-size: 14px;
}

.link {
  color: #10b981;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.link:hover {
  color: #06b6d4;
  text-decoration: underline;
}

.back-link {
  display: inline-block;
  color: #999;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #10b981;
}

/* Responsive design */
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }

  .login-card {
    border-radius: 12px;
  }

  .login-header {
    padding: 30px 20px;
  }

  .login-header h2 {
    font-size: 24px;
  }

  .login-form {
    padding: 24px 20px;
  }

  .login-footer {
    padding: 0 20px 24px;
  }
}
</style>