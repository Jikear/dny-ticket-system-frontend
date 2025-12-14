<template>
    <div class="auth-page">
      <h2>用户注册</h2>
  
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-item">
          <label>用户名</label>
          <input v-model="form.username" required />
        </div>
  
        <div class="form-item">
          <label>密码</label>
          <input v-model="form.password" type="password" required />
        </div>
  
        <div class="form-item">
          <label>昵称</label>
          <input v-model="form.nickname" />
        </div>
  
        <div class="form-item">
          <label>手机号</label>
          <input v-model="form.phone" />
        </div>
  
        <div class="form-item">
          <label>邮箱</label>
          <input v-model="form.email" type="email" />
        </div>
  
        <button type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
  
      <p class="tips">
        已有账号？
        <a @click.prevent="goLogin" href="#">去登录</a>
      </p>
  
      <p v-if="msg" class="success">{{ msg }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive, ref } from 'vue'
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
  
  const loading = ref(false)
  const msg = ref('')
  const error = ref('')
  
  const handleRegister = async () => {
    msg.value = ''
    error.value = ''
    loading.value = true
    try {
      await registerApi(form)
      msg.value = '注册成功，请前往登录'
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
  
  const goLogin = () => {
    router.push({ name: 'Login' })
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
  .success {
    color: green;
    margin-top: 8px;
  }
  .error {
    color: red;
    margin-top: 8px;
  }
  </style>