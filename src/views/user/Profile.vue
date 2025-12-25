<template>
  <div class="user-page">
    <header class="page-header">
      <router-link to="/" class="back-link">← 返回首页</router-link>
      <h1>个人中心</h1>
    </header>

    <div class="user-container">
      <div class="sidebar">
        <router-link to="/user/profile" class="menu-item active">个人信息</router-link>
        <router-link to="/user/orders" class="menu-item">我的订单</router-link>
        <router-link to="/user/password" class="menu-item">修改密码</router-link>
      </div>

      <div class="content">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="profile-card">
          <h2>个人信息</h2>
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-field">
                <label>用户名</label>
                <input type="text" :value="profile?.username" disabled />
              </div>
              <div class="form-field">
                <label>角色</label>
                <input type="text" :value="roleText" disabled />
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>昵称</label>
                <input type="text" v-model="form.nickname" placeholder="请输入昵称" />
              </div>
              <div class="form-field">
                <label>真实姓名</label>
                <input type="text" v-model="form.realName" placeholder="请输入真实姓名" />
              </div>
            </div>

            <div class="form-field">
              <label>身份证号</label>
              <input type="text" v-model="form.idCard" placeholder="请输入身份证号" />
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>手机号</label>
                <input type="tel" v-model="form.phone" placeholder="请输入手机号" />
              </div>
              <div class="form-field">
                <label>邮箱</label>
                <input type="email" v-model="form.email" placeholder="请输入邮箱" />
              </div>
            </div>

            <div class="form-field">
              <label>地区</label>
              <input type="text" v-model="form.region" placeholder="请输入省份/地区" />
            </div>

            <div class="form-actions">
              <button type="submit" :disabled="saving">
                {{ saving ? '保存中...' : '保存修改' }}
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
import { ref, reactive, computed, onMounted } from 'vue'
import { getUserProfile, updateUserProfile } from '@/api/user'
import type { User } from '@/types'

const profile = ref<User | null>(null)
const loading = ref(true)
const saving = ref(false)
const success = ref('')
const error = ref('')

const form = reactive({
  nickname: '',
  realName: '',
  idCard: '',
  phone: '',
  email: '',
  region: ''
})

const roleText = computed(() => {
  switch (profile.value?.role) {
    case 'ADMIN': return '管理员'
    case 'STAFF': return '工作人员'
    case 'USER': return '普通用户'
    default: return '-'
  }
})

const loadProfile = async () => {
  try {
    const res = await getUserProfile()
    profile.value = res.data
    // Initialize form with current values
    form.nickname = res.data.nickname || ''
    form.realName = res.data.realName || ''
    form.idCard = res.data.idCard || ''
    form.phone = res.data.phone || ''
    form.email = res.data.email || ''
    form.region = res.data.region || ''
  } catch (e) {
    console.error('Failed to load profile:', e)
    error.value = '加载用户信息失败'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  success.value = ''
  error.value = ''
  saving.value = true

  try {
    const res = await updateUserProfile({
      nickname: form.nickname || undefined,
      realName: form.realName || undefined,
      idCard: form.idCard || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      region: form.region || undefined
    })
    profile.value = res.data
    success.value = '保存成功'
  } catch (e: any) {
    error.value = e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
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
  color: #667eea;
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
  background: #667eea;
  color: #fff;
}

.content {
  flex: 1;
}

.loading {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  color: #666;
}

.profile-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.profile-card h2 {
  margin: 0 0 24px;
  color: #1a1a2e;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
  border-color: #667eea;
}

.form-field input:disabled {
  background: #f5f5f5;
  color: #999;
}

.form-actions {
  margin-top: 24px;
}

.form-actions button {
  padding: 12px 32px;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.form-actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.success-msg {
  color: #4caf50;
  margin-top: 16px;
}

.error-msg {
  color: #e74c3c;
  margin-top: 16px;
}
</style>
