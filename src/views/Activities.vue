<template>
  <div class="activities-page">
    <header class="page-header">
      <router-link to="/" class="back-link">← 返回首页</router-link>
      <h1>精彩活动</h1>
    </header>

    <div class="activities-container">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="activities.length === 0" class="empty">暂无活动</div>
      <div v-else class="activity-grid">
        <div v-for="activity in activities" :key="activity.id" class="activity-card" @click="viewDetail(activity.id)">
          <div class="activity-image" :style="{ backgroundImage: activity.imageUrl ? `url(${activity.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
            <span v-if="activity.status === 1" class="status-badge active">进行中</span>
            <span v-else class="status-badge inactive">已结束</span>
          </div>
          <div class="activity-info">
            <h3>{{ activity.name }}</h3>
            <p v-if="activity.location" class="activity-location">📍 {{ activity.location }}</p>
            <p v-if="activity.dailyStartTime" class="activity-time">
              🕐 每日 {{ activity.dailyStartTime?.substring(0, 5) }} - {{ activity.dailyEndTime?.substring(0, 5) }}
            </p>
            <p v-if="activity.startDate" class="activity-date">
              📅 {{ activity.startDate }} 至 {{ activity.endDate }}
            </p>
            <p class="activity-desc">{{ activity.description || '暂无描述' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity Detail Modal -->
    <div v-if="selectedActivity" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-content">
        <button class="modal-close" @click="closeDetail">×</button>
        <div class="modal-image" :style="{ backgroundImage: selectedActivity.imageUrl ? `url(${selectedActivity.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"></div>
        <div class="modal-info">
          <h2>{{ selectedActivity.name }}</h2>
          <div class="detail-item" v-if="selectedActivity.location">
            <span class="detail-label">📍 地点</span>
            <span class="detail-value">{{ selectedActivity.location }}</span>
          </div>
          <div class="detail-item" v-if="selectedActivity.dailyStartTime">
            <span class="detail-label">🕐 时间</span>
            <span class="detail-value">每日 {{ selectedActivity.dailyStartTime?.substring(0, 5) }} - {{ selectedActivity.dailyEndTime?.substring(0, 5) }}</span>
          </div>
          <div class="detail-item" v-if="selectedActivity.startDate">
            <span class="detail-label">📅 日期</span>
            <span class="detail-value">{{ selectedActivity.startDate }} 至 {{ selectedActivity.endDate }}</span>
          </div>
          <div class="detail-desc">
            <h4>活动介绍</h4>
            <p>{{ selectedActivity.description || '暂无描述' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getActivities, getActivityById } from '@/api/park'
import type { Activity } from '@/types'

const activities = ref<Activity[]>([])
const loading = ref(true)
const selectedActivity = ref<Activity | null>(null)

const loadActivities = async () => {
  try {
    const res = await getActivities()
    activities.value = res.data
  } catch (e) {
    console.error('Failed to load activities:', e)
  } finally {
    loading.value = false
  }
}

const viewDetail = async (id: number) => {
  try {
    const res = await getActivityById(id)
    selectedActivity.value = res.data
  } catch (e) {
    console.error('Failed to load activity detail:', e)
  }
}

const closeDetail = () => {
  selectedActivity.value = null
}

onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.activities-page {
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

.activities-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.activity-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.activity-image {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: #4caf50;
  color: #fff;
}

.status-badge.inactive {
  background: #9e9e9e;
  color: #fff;
}

.activity-info {
  padding: 16px;
}

.activity-info h3 {
  margin: 0 0 12px;
  color: #1a1a2e;
  font-size: 18px;
}

.activity-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.activity-desc {
  margin-top: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 24px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1;
}

.modal-image {
  height: 240px;
  background-size: cover;
  background-position: center;
}

.modal-info {
  padding: 24px;
}

.modal-info h2 {
  margin: 0 0 16px;
  color: #1a1a2e;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
}

.detail-label {
  width: 80px;
  color: #666;
}

.detail-value {
  flex: 1;
  color: #333;
}

.detail-desc {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.detail-desc h4 {
  margin: 0 0 8px;
  color: #1a1a2e;
}

.detail-desc p {
  color: #666;
  line-height: 1.6;
}
</style>
