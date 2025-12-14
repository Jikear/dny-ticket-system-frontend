<template>
    <div class="home-page">
      <h1>滇南民族风情园票务管理系统</h1>
  
      <p v-if="userStore.username">
        当前用户：{{ userStore.username }}（角色：{{ userStore.role }}）
      </p>
  
      <p v-if="me">
        后端 /me 接口返回的用户信息：
        <pre>{{ me }}</pre>
      </p>
  
      <div class="actions">
        <button @click="loadMe">刷新用户信息 /me</button>
        <button @click="logout">退出登录</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/store/user'
  import { getMeApi } from '@/api/auth'
  
  const router = useRouter()
  const userStore = useUserStore()
  
  const me = ref<any>(null)
  
  const loadMe = async () => {
    try {
      const res = await getMeApi()
      me.value = res.data
    } catch (e) {
      console.error(e)
    }
  }
  
  const logout = () => {
    userStore.clearUser()
    router.push({ name: 'Login' })
  }
  </script>
  
  <style scoped>
  .home-page {
    max-width: 800px;
    margin: 40px auto;
  }
  .actions {
    margin-top: 16px;
  }
  button {
    margin-right: 8px;
  }
  pre {
    background: #f5f5f5;
    padding: 8px;
  }
  </style>