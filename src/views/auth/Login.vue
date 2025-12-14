<template>
    <div class="auth-page">
      <h2>用户登录</h2>
  
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-item">
          <label>用户名</label>
          <input v-model="form.username" required />
        </div>
  
        <div class="form-item">
          <label>密码</label>
          <input v-model="form.password" type="password" required />
        </div>
  
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
  
      <p class="tips">
        还没有账号？
        <a @click.prevent="goRegister" href="#">去注册</a>
      </p>
  
      <p v-if="error" class="error">{{ error }}</p>
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

  
  const goRegister = () => {
    router.push({ name: 'Register' })
  }
  </script>
  
  <style scoped>
  .auth-page {
    max-width: 400px;
    margin: 80px auto;
    padding: 24px;
    border: 1px solid #eee;
    border-radius: 8px;
  }
  .auth-form {
    display: flex;
    flex-direction: column;
  }
  .form-item {
    margin-bottom: 16px;
  }
  .form-item label {
    display: block;
    margin-bottom: 4px;
  }
  .form-item input {
    width: 100%;
    padding: 6px 8px;
    box-sizing: border-box;
  }
  button {
    padding: 8px 12px;
    width: 100%;
  }
  .tips {
    margin-top: 12px;
    font-size: 14px;
  }
  .error {
    color: red;
    margin-top: 8px;
  }
  </style>