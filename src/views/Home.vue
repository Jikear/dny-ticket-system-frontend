<template>
  <div class="home-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1 class="logo">{{ parkInfo?.name || '滇南大观园' }}</h1>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/activities" class="nav-link">活动</router-link>
          <router-link to="/announcements" class="nav-link">公告</router-link>
          <router-link to="/booking" class="nav-link">预约购票</router-link>
          <template v-if="userStore.username">
            <router-link to="/user/profile" class="nav-link">个人中心</router-link>
            <router-link to="/user/orders" class="nav-link">我的订单</router-link>
            <router-link v-if="userStore.role === 'ADMIN'" to="/admin" class="nav-link admin-link">管理后台</router-link>
            <span class="user-info">{{ userStore.username }}</span>
            <button @click="logout" class="logout-btn">退出</button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link">登录</router-link>
            <router-link to="/register" class="nav-link">注册</router-link>
          </template>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero" :style="heroStyle">
      <div class="hero-content">
        <h2>欢迎来到{{ parkInfo?.name || '滇南大观园' }}</h2>
        <p>{{ parkInfo?.description || '体验云南民族文化的魅力' }}</p>
        <router-link to="/booking" class="cta-btn">立即预约</router-link>
      </div>
    </section>

    <!-- Park Info -->
    <section class="section">
      <h3 class="section-title">园区信息</h3>
      <div class="info-cards">
        <div class="info-card">
          <div class="info-icon">🕐</div>
          <div class="info-label">开放时间</div>
          <div class="info-value">{{ parkInfo?.openingHours || '09:00-18:00' }}</div>
        </div>
        <div class="info-card">
          <div class="info-icon">📞</div>
          <div class="info-label">联系电话</div>
          <div class="info-value">{{ parkInfo?.contactPhone || '0871-12345678' }}</div>
        </div>
        <div class="info-card">
          <div class="info-icon">📍</div>
          <div class="info-label">园区地址</div>
          <div class="info-value">{{ parkInfo?.address || '云南省' }}</div>
        </div>
      </div>
      <div v-if="parkInfo?.notice" class="notice">
        <strong>游客须知：</strong>{{ parkInfo.notice }}
      </div>
    </section>

    <!-- Announcements -->
    <section v-if="announcements.length > 0" class="section">
      <h3 class="section-title">最新公告</h3>
      <div class="announcement-list">
        <div v-for="item in announcements.slice(0, 3)" :key="item.id" class="announcement-item">
          <span v-if="item.pinned" class="pin-badge">置顶</span>
          <span :class="['type-badge', `type-${item.type.toLowerCase()}`]">
            {{ item.type === 'NOTICE' ? '通知' : item.type === 'WARNING' ? '预警' : '闭园' }}
          </span>
          <router-link :to="`/announcements/${item.id}`" class="announcement-title">{{ item.title }}</router-link>
          <span class="announcement-time">{{ item.publishTime }}</span>
        </div>
      </div>
      <router-link to="/announcements" class="view-more">查看全部公告 →</router-link>
    </section>

    <!-- Current Activities -->
    <section v-if="activities.length > 0" class="section">
      <h3 class="section-title">精彩活动</h3>
      <div class="activity-grid">
        <div v-for="activity in activities.slice(0, 4)" :key="activity.id" class="activity-card">
          <div class="activity-image" :style="{ backgroundImage: activity.imageUrl ? `url(${activity.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"></div>
          <div class="activity-info">
            <h4>{{ activity.name }}</h4>
            <p v-if="activity.location">📍 {{ activity.location }}</p>
            <p v-if="activity.dailyStartTime">🕐 {{ activity.dailyStartTime?.substring(0, 5) }} - {{ activity.dailyEndTime?.substring(0, 5) }}</p>
          </div>
        </div>
      </div>
      <router-link to="/activities" class="view-more">查看全部活动 →</router-link>
    </section>

    <!-- Ticket Types -->
    <section class="section">
      <h3 class="section-title">票价信息</h3>
      <div class="ticket-grid">
        <div v-for="ticket in ticketTypes" :key="ticket.id" class="ticket-card">
          <h4>{{ ticket.name }}</h4>
          <div class="ticket-price">¥{{ ticket.price.toFixed(2) }}</div>
          <p class="ticket-desc">{{ ticket.description }}</p>
          <router-link to="/booking" class="ticket-btn">立即预约</router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2024 {{ parkInfo?.name || '滇南大观园' }} 版权所有</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getParkInfo, getCurrentActivities } from '@/api/park'
import { getTicketTypes } from '@/api/ticket'
import { getAnnouncements } from '@/api/announcement'
import type { ParkInfo, Activity, TicketType, Announcement } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const parkInfo = ref<ParkInfo | null>(null)
const activities = ref<Activity[]>([])
const ticketTypes = ref<TicketType[]>([])
const announcements = ref<Announcement[]>([])

const heroStyle = computed(() => {
  if (parkInfo.value?.logoUrl) {
    const urlString = parkInfo.value.logoUrl
    
    // Validate URL format
    try {
      // For http/https URLs, validate using URL constructor
      if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
        const url = new URL(urlString)
        // Only allow http and https protocols
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          return {
            backgroundImage: `linear-gradient(rgba(102, 126, 234, 0.7), rgba(118, 75, 162, 0.7)), url("${urlString}")`
          }
        }
      }
      // For data URIs, check basic format
      else if (urlString.startsWith('data:image/')) {
        // Basic validation for data URI
        if (urlString.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/)) {
          return {
            backgroundImage: `linear-gradient(rgba(102, 126, 234, 0.7), rgba(118, 75, 162, 0.7)), url("${urlString}")`
          }
        }
      }
    } catch (e) {
      // Invalid URL, fall back to default gradient
      console.warn('Invalid logoUrl:', urlString)
    }
  }
  return {
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
})

const loadData = async () => {
  try {
    const [parkRes, activityRes, ticketRes, announcementRes] = await Promise.all([
      getParkInfo(),
      getCurrentActivities(),
      getTicketTypes(),
      getAnnouncements()
    ])
    parkInfo.value = parkRes.data
    activities.value = activityRes.data
    ticketTypes.value = ticketRes.data
    announcements.value = announcementRes.data
  } catch (e) {
    console.error('Failed to load data:', e)
  }
}

const logout = () => {
  userStore.clearUser()
  router.push({ name: 'Login' })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  font-size: 24px;
  color: #1a1a2e;
  margin: 0;
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}

.nav-link:hover {
  background: #f0f0f0;
}

.admin-link {
  color: #e74c3c;
  font-weight: 500;
}

.user-info {
  color: #666;
  font-size: 14px;
}

.logout-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
  background-position: center;
  color: #fff;
  padding: 80px 20px;
  text-align: center;
}

.hero-content h2 {
  font-size: 36px;
  margin-bottom: 16px;
}

.hero-content p {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 24px;
}

.cta-btn {
  display: inline-block;
  background: #fff;
  color: #667eea;
  padding: 12px 32px;
  border-radius: 24px;
  text-decoration: none;
  font-weight: 500;
  transition: transform 0.2s;
}

.cta-btn:hover {
  transform: scale(1.05);
}

.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.section-title {
  font-size: 24px;
  color: #1a1a2e;
  margin-bottom: 24px;
  text-align: center;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-card {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.info-label {
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
}

.info-value {
  color: #1a1a2e;
  font-size: 16px;
  font-weight: 500;
}

.notice {
  background: #fff3cd;
  color: #856404;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.announcement-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.announcement-item {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 12px;
}

.announcement-item:last-child {
  border-bottom: none;
}

.pin-badge {
  background: #e74c3c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.type-notice {
  background: #e3f2fd;
  color: #1565c0;
}

.type-warning {
  background: #fff3e0;
  color: #ef6c00;
}

.type-closure {
  background: #ffebee;
  color: #c62828;
}

.announcement-title {
  flex: 1;
  color: #333;
  text-decoration: none;
}

.announcement-title:hover {
  color: #667eea;
}

.announcement-time {
  color: #999;
  font-size: 14px;
}

.view-more {
  display: block;
  text-align: center;
  margin-top: 16px;
  color: #667eea;
  text-decoration: none;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.activity-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.activity-image {
  height: 160px;
  background-size: cover;
  background-position: center;
}

.activity-info {
  padding: 16px;
}

.activity-info h4 {
  margin: 0 0 8px;
  color: #1a1a2e;
}

.activity-info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.ticket-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.ticket-card {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ticket-card h4 {
  margin: 0 0 12px;
  color: #1a1a2e;
}

.ticket-price {
  font-size: 32px;
  color: #e74c3c;
  font-weight: 700;
  margin-bottom: 8px;
}

.ticket-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.ticket-btn {
  display: inline-block;
  background: #667eea;
  color: #fff;
  padding: 8px 24px;
  border-radius: 4px;
  text-decoration: none;
}

.footer {
  background: #1a1a2e;
  color: #fff;
  text-align: center;
  padding: 24px;
  margin-top: 40px;
}
</style>