<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Header with gradient -->
      <div class="register-header">
        <div class="logo-icon">🎫</div>
        <h2>创建账户</h2>
        <p>注册滇南大观园票务系统账号</p>
      </div>

      <!-- Register Form -->
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Username field -->
        <div class="form-group">
          <label for="username">
            <span class="label-icon">👤</span>
            用户名
            <span class="required">*</span>
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
            <span class="required">*</span>
          </label>
          <div class="input-wrapper password-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码（至少6位）"
              required
              minlength="6"
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

        <!-- Confirm Password field -->
        <div class="form-group">
          <label for="confirmPassword">
            <span class="label-icon">🔐</span>
            确认密码
            <span class="required">*</span>
          </label>
          <div class="input-wrapper password-wrapper">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="请再次输入密码"
              required
              :class="{ 'has-value': confirmPassword, 'input-error': passwordMismatch }"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
              :title="showConfirmPassword ? '隐藏密码' : '显示密码'"
            >
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <transition name="fade">
            <span v-if="passwordMismatch" class="field-error">两次输入的密码不一致</span>
          </transition>
        </div>

        <!-- Nickname field -->
        <div class="form-group">
          <label for="nickname">
            <span class="label-icon">😊</span>
            昵称
          </label>
          <div class="input-wrapper">
            <input
              id="nickname"
              v-model="form.nickname"
              type="text"
              placeholder="请输入昵称（选填）"
              :class="{ 'has-value': form.nickname }"
            />
          </div>
        </div>

        <!-- Phone field -->
        <div class="form-group">
          <label for="phone">
            <span class="label-icon">📱</span>
            手机号
          </label>
          <div class="input-wrapper">
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              placeholder="请输入手机号（选填）"
              :class="{ 'has-value': form.phone }"
            />
          </div>
        </div>

        <!-- Email field -->
        <div class="form-group">
          <label for="email">
            <span class="label-icon">📧</span>
            邮箱
          </label>
          <div class="input-wrapper">
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱（选填）"
              :class="{ 'has-value': form.email }"
            />
          </div>
        </div>

        <!-- Success message -->
        <transition name="fade">
          <div v-if="msg" class="success-message">
            <span class="success-icon">✅</span>
            {{ msg }}
          </div>
        </transition>

        <!-- Error message -->
        <transition name="fade">
          <div v-if="error" class="error-message">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>
        </transition>

        <!-- Submit button -->
        <button type="submit" class="submit-btn" :disabled="loading || passwordMismatch">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '注册中...' : '注 册' }}
        </button>
      </form>

      <!-- Footer links -->
      <div class="register-footer">
        <p>
          已有账号？
          <router-link to="/login" class="link">立即登录</router-link>
        </p>
        <router-link to="/" class="back-link">← 返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { registerApi } from '@/api/auth'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  phone: '',
  email: ''
})

const confirmPassword = ref('')
const loading = ref(false)
const msg = ref('')
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordMismatch = computed(() => {
  return form.password.length > 0 && confirmPassword.value.length > 0 && form.password !== confirmPassword.value
})

const handleRegister = async () => {
  msg.value = ''
  error.value = ''

  // Validate password match
  if (form.password !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  try {
    await registerApi(form)
    msg.value = '注册成功，即将跳转到登录页面...'
    // 2 秒后自动跳转登录
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, 2000)
  } catch (e: any) {
    error.value = e?.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  padding: 20px;
  perspective: 1000px;
}

.register-card {
  width: 100%;
  max-width: 460px;
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

.register-header {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: #fff;
  padding: 32px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.register-header::before {
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
  font-size: 42px;
  margin-bottom: 10px;
}

.register-header h2 {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 600;
}

.register-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 13px;
}

.register-form {
  padding: 28px 30px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.label-icon {
  font-size: 15px;
}

.required {
  color: #e53e3e;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 14px;
  font-size: 14px;
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

.input-wrapper input.input-error {
  border-color: #e53e3e;
}

.input-wrapper input.input-error:focus {
  box-shadow: 0 0 0 4px rgba(229, 62, 62, 0.1);
}

.input-wrapper input::placeholder {
  color: #aaa;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 46px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 1;
}

.field-error {
  display: block;
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fff4;
  color: #38a169;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  border: 1px solid #9ae6b4;
}

.success-icon {
  flex-shrink: 0;
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
  margin-bottom: 16px;
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

.register-footer {
  padding: 0 30px 28px;
  text-align: center;
}

.register-footer p {
  margin: 0 0 14px;
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
  .register-container {
    padding: 10px;
  }

  .register-card {
    border-radius: 12px;
  }

  .register-header {
    padding: 24px 20px;
  }

  .register-header h2 {
    font-size: 22px;
  }

  .register-form {
    padding: 20px;
  }

  .register-footer {
    padding: 0 20px 20px;
  }
}
</style>