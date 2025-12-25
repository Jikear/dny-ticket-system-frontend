<template>
  <div class="announcements-page">
    <header class="page-header">
      <router-link to="/" class="back-link">← 返回首页</router-link>
      <h1>公告通知</h1>
    </header>

    <div class="announcements-container">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="announcements.length === 0" class="empty">暂无公告</div>
      <div v-else class="announcement-list">
        <div v-for="item in announcements" :key="item.id" class="announcement-card" @click="viewDetail(item)">
          <div class="announcement-header">
            <span v-if="item.pinned" class="pin-badge">置顶</span>
            <span :class="['type-badge', `type-${item.type.toLowerCase()}`]">
              {{ item.type === 'NOTICE' ? '通知' : item.type === 'WARNING' ? '预警' : '闭园通知' }}
            </span>
            <h3>{{ item.title }}</h3>
          </div>
          <p class="announcement-preview">{{ item.content || '暂无内容' }}</p>
          <div class="announcement-footer">
            <span class="publish-time">{{ item.publishTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedAnnouncement" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-content">
        <button class="modal-close" @click="closeDetail">×</button>
        <div class="modal-header">
          <span v-if="selectedAnnouncement.pinned" class="pin-badge">置顶</span>
          <span :class="['type-badge', `type-${selectedAnnouncement.type.toLowerCase()}`]">
            {{ selectedAnnouncement.type === 'NOTICE' ? '通知' : selectedAnnouncement.type === 'WARNING' ? '预警' : '闭园通知' }}
          </span>
        </div>
        <h2>{{ selectedAnnouncement.title }}</h2>
        <div class="modal-meta">
          <span>发布时间：{{ selectedAnnouncement.publishTime }}</span>
        </div>
        <div class="modal-body">
          <p>{{ selectedAnnouncement.content || '暂无内容' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getAnnouncements, getAnnouncementById } from '@/api/announcement'
import type { Announcement } from '@/types'

const route = useRoute()
const announcements = ref<Announcement[]>([])
const loading = ref(true)
const selectedAnnouncement = ref<Announcement | null>(null)

const loadAnnouncements = async () => {
  try {
    const res = await getAnnouncements()
    announcements.value = res.data
  } catch (e) {
    console.error('Failed to load announcements:', e)
  } finally {
    loading.value = false
  }
}

const viewDetail = async (item: Announcement) => {
  try {
    const res = await getAnnouncementById(item.id)
    selectedAnnouncement.value = res.data
  } catch (e) {
    console.error('Failed to load announcement detail:', e)
  }
}

const closeDetail = () => {
  selectedAnnouncement.value = null
}

onMounted(async () => {
  await loadAnnouncements()
  // Check if there's an ID in the route params
  const id = route.params.id
  if (id) {
    const res = await getAnnouncementById(Number(id))
    selectedAnnouncement.value = res.data
  }
})
</script>

<style scoped>
.announcements-page {
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

.announcements-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 20px;
}

.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.announcement-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.announcement-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.announcement-header h3 {
  margin: 0;
  flex: 1;
  color: #1a1a2e;
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

.announcement-preview {
  color: #666;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.announcement-footer {
  display: flex;
  justify-content: flex-end;
}

.publish-time {
  color: #999;
  font-size: 14px;
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
  padding: 24px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  color: #666;
  font-size: 24px;
  border-radius: 50%;
  cursor: pointer;
}

.modal-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.modal-content h2 {
  margin: 0 0 12px;
  color: #1a1a2e;
}

.modal-meta {
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.modal-body {
  color: #333;
  line-height: 1.8;
}

.modal-body p {
  white-space: pre-wrap;
}
</style>
