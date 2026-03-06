<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>管理后台</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" exact-active-class="active">
          <span class="icon">📊</span>
          <span>数据统计</span>
        </router-link>
        <router-link v-if="userStore.role === 'ADMIN'" to="/admin/users" class="nav-item" active-class="active">
          <span class="icon">👥</span>
          <span>用户管理</span>
        </router-link>
        <router-link to="/admin/tickets" class="nav-item" active-class="active">
          <span class="icon">🎫</span>
          <span>票种管理</span>
        </router-link>
        <router-link to="/admin/slots" class="nav-item" active-class="active">
          <span class="icon">🕐</span>
          <span>时段管理</span>
        </router-link>
        <router-link to="/admin/orders" class="nav-item" active-class="active">
          <span class="icon">📋</span>
          <span>订单管理</span>
        </router-link>
        <router-link to="/admin/verify" class="nav-item" active-class="active">
          <span class="icon">📱</span>
          <span>入园核销</span>
        </router-link>
        <router-link to="/admin/park" class="nav-item" active-class="active">
          <span class="icon">🏞️</span>
          <span>园区信息</span>
        </router-link>
        <router-link to="/admin/activities" class="nav-item" active-class="active">
          <span class="icon">🎭</span>
          <span>活动管理</span>
        </router-link>
        <router-link to="/admin/announcements" class="nav-item" active-class="active">
          <span class="icon">📢</span>
          <span>公告管理</span>
        </router-link>
        <router-link v-if="userStore.role === 'ADMIN'" to="/admin/logs" class="nav-item" active-class="active">
          <span class="icon">📝</span>
          <span>操作日志</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/" class="back-link">← 返回前台</router-link>
      </div>
    </aside>
    <main class="main-content">
      <header class="main-header">
        <h1>{{ pageTitle }}</h1>
        <div class="user-info">
          <span>{{ userStore.username }}</span>
          <button @click="logout" class="logout-btn">退出</button>
        </div>
      </header>
      <div class="content-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin': '数据统计',
    '/admin/users': '用户管理',
    '/admin/tickets': '票种管理',
    '/admin/slots': '时段管理',
    '/admin/orders': '订单管理',
    '/admin/verify': '入园核销',
    '/admin/park': '园区信息',
    '/admin/activities': '活动管理',
    '/admin/announcements': '公告管理',
    '/admin/logs': '操作日志'
  }
  return titles[route.path] || '管理后台'
})

const logout = () => {
  userStore.clearUser()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 240px;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  color: #fff;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
}

.nav-item .icon {
  font-size: 18px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.back-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
}

.back-link:hover {
  color: #fff;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
}

.main-header {
  background: #fff;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.main-header h1 {
  margin: 0;
  font-size: 20px;
  color: #1a1a2e;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info span {
  color: #666;
}

.logout-btn {
  padding: 6px 16px;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.content-body {
  flex: 1;
  padding: 24px;
}
</style>
