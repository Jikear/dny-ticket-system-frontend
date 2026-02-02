<template>
  <div class="user-page">
    <header class="page-header">
      <router-link to="/" class="back-link">← 返回首页</router-link>
      <h1>修改密码</h1>
    </header>

    <div class="user-container">
      <div class="sidebar">
        <router-link to="/user/profile" class="menu-item">个人信息</router-link>
        <router-link to="/user/orders" class="menu-item">我的订单</router-link>
        <router-link to="/user/password" class="menu-item active">修改密码</router-link>
      </div>

      <div class="content">
        <div class="password-card">
          <h2>修改密码</h2>
          <form @submit.prevent="handleSubmit">
            <div class="form-field">
              <label>当前密码</label>
              <input type="password" v-model="form.oldPassword" required placeholder="请输入当前密码" />
            </div>

            <div class="form-field">
              <label>新密码</label>
              <input type="password" v-model="form.newPassword" required placeholder="请输入新密码" />
            </div>

            <div class="form-field">
              <label>确认新密码</label>
              <input type="password" v-model="confirmPassword" required placeholder="请再次输入新密码" />
            </div>

            <div class="form-actions">
              <button type="submit" :disabled="saving">
                {{ saving ? '修改中...' : '确认修改' }}
              </button>
            </div>

            <p v-if="success" class="success-msg">{{ success }}</p>
            <p v-if="error" class="error-msg">{{ error }}</p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { changePassword } from '@/api/user'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  oldPassword: '',
  newPassword: ''
})

const confirmPassword = ref('')
const saving = ref(false)
const success = ref('')
const error = ref('')

const handleSubmit = async () => {
  success.value = ''
  error.value = ''

  if (form.newPassword !== confirmPassword.value) {
    error.value = '两次输入的新密码不一致'
    return
  }

  if (form.newPassword.length < 6) {
    error.value = '新密码长度不能少于6位'
    return
  }

  saving.value = true

  try {
    await changePassword(form)
    success.value = '密码修改成功，请重新登录'
    // Clear form
    form.oldPassword = ''
    form.newPassword = ''
    confirmPassword.value = ''
    // Logout after 2 seconds
    setTimeout(() => {
      userStore.clearUser()
      router.push({ name: 'Login' })
    }, 2000)
  } catch (e: any) {
    error.value = e?.message || '密码修改失败'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.user-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  background: #fff;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-link {
  color: #10b981;
  text-decoration: none;
  font-size: 14px;
}

.page-header h1 {
  margin: 12px 0 0;
  color: #1a1a2e;
}

.user-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  gap: 24px;
}

.sidebar {
  width: 200px;
  background: #fff;
  border-radius: 8px;
  padding: 8px;
  height: fit-content;
}

.menu-item {
  display: block;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  border-radius: 6px;
  margin-bottom: 4px;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.active {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: #fff;
}

.content {
  flex: 1;
}

.password-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
}

.password-card h2 {
  margin: 0 0 24px;
  color: #1a1a2e;
}

.form-field {
  margin-bottom: 16px;
}

.form-field label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 6px;
}

.form-field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
}

.form-field input:focus {
  outline: none;
  border-color: #10b981;
}

.form-actions {
  margin-top: 24px;
}

.form-actions button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.form-actions button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.form-actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.success-msg {
  color: #4caf50;
  margin-top: 16px;
  text-align: center;
}

.error-msg {
  color: #e74c3c;
  margin-top: 16px;
  text-align: center;
}
</style>
