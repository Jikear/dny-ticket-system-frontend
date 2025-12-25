<template>
  <div class="admin-page">
    <div class="page-actions">
      <button @click="openCreateModal" class="btn-primary">+ 新增公告</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>类型</th>
            <th>置顶</th>
            <th>状态</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in announcements" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.title }}</td>
            <td>
              <span :class="['type-badge', `type-${item.type.toLowerCase()}`]">
                {{ typeText(item.type) }}
              </span>
            </td>
            <td>
              <span v-if="item.pinned" class="pin-badge">置顶</span>
              <span v-else>-</span>
            </td>
            <td>
              <span :class="['status-badge', item.status === 1 ? 'active' : 'inactive']">
                {{ item.status === 1 ? '已发布' : '草稿' }}
              </span>
            </td>
            <td>{{ item.publishTime || '-' }}</td>
            <td>
              <button @click="openEditModal(item)" class="btn-link">编辑</button>
              <button @click="handleDelete(item)" class="btn-link danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="currentPage === 0" @click="changePage(currentPage - 1)">上一页</button>
        <span>第 {{ currentPage + 1 }} / {{ totalPages }} 页</span>
        <button :disabled="currentPage >= totalPages - 1" @click="changePage(currentPage + 1)">下一页</button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ editingItem ? '编辑公告' : '新增公告' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-field">
            <label>标题 *</label>
            <input type="text" v-model="form.title" required />
          </div>
          <div class="form-field">
            <label>内容</label>
            <textarea v-model="form.content" rows="6"></textarea>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>类型</label>
              <select v-model="form.type">
                <option value="NOTICE">通知</option>
                <option value="WARNING">预警</option>
                <option value="CLOSURE">闭园通知</option>
              </select>
            </div>
            <div class="form-field">
              <label>状态</label>
              <select v-model.number="form.status">
                <option :value="1">发布</option>
                <option :value="0">草稿</option>
              </select>
            </div>
          </div>
          <div class="form-field checkbox">
            <label>
              <input type="checkbox" v-model="pinnedChecked" />
              置顶显示
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">取消</button>
            <button type="submit" :disabled="submitting" class="btn-primary">
              {{ submitting ? '保存中...' : '保存' }}
            </button>
          </div>
          <p v-if="error" class="error-msg">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  getAdminAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} from '@/api/announcement'
import type { Announcement, AnnouncementType } from '@/types'

const announcements = ref<Announcement[]>([])
const loading = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 10

const showModal = ref(false)
const submitting = ref(false)
const error = ref('')
const editingItem = ref<Announcement | null>(null)

const form = reactive({
  title: '',
  content: '',
  type: 'NOTICE' as AnnouncementType,
  pinned: 0,
  status: 1
})

const pinnedChecked = computed({
  get: () => form.pinned === 1,
  set: (val: boolean) => { form.pinned = val ? 1 : 0 }
})

const typeText = (type: string) => {
  switch (type) {
    case 'NOTICE': return '通知'
    case 'WARNING': return '预警'
    case 'CLOSURE': return '闭园通知'
    default: return type
  }
}

const loadAnnouncements = async (page = 0) => {
  loading.value = true
  try {
    const res = await getAdminAnnouncements(page, pageSize)
    announcements.value = res.data.content
    totalPages.value = res.data.totalPages
    currentPage.value = res.data.number
  } catch (e) {
    console.error('Failed to load announcements:', e)
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  loadAnnouncements(page)
}

const openCreateModal = () => {
  editingItem.value = null
  form.title = ''
  form.content = ''
  form.type = 'NOTICE'
  form.pinned = 0
  form.status = 1
  error.value = ''
  showModal.value = true
}

const openEditModal = (item: Announcement) => {
  editingItem.value = item
  form.title = item.title
  form.content = item.content || ''
  form.type = item.type
  form.pinned = item.pinned
  form.status = item.status
  error.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
}

const handleSubmit = async () => {
  submitting.value = true
  error.value = ''

  try {
    const data = {
      title: form.title,
      content: form.content || undefined,
      type: form.type,
      pinned: form.pinned,
      status: form.status
    }
    
    if (editingItem.value) {
      await updateAnnouncement(editingItem.value.id, data)
    } else {
      await createAnnouncement(data)
    }
    closeModal()
    loadAnnouncements(currentPage.value)
  } catch (e: any) {
    error.value = e?.message || '操作失败'
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (item: Announcement) => {
  if (!confirm(`确定要删除公告 "${item.title}" 吗？`)) return
  
  try {
    await deleteAnnouncement(item.id)
    loadAnnouncements(currentPage.value)
  } catch (e: any) {
    alert(e?.message || '删除失败')
  }
}

onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped>
.admin-page {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.btn-primary {
  padding: 10px 20px;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f9f9f9;
  font-weight: 600;
  color: #333;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.type-notice { background: #e3f2fd; color: #1565c0; }
.type-warning { background: #fff3e0; color: #ef6c00; }
.type-closure { background: #ffebee; color: #c62828; }

.pin-badge {
  background: #e74c3c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge.active { background: #e8f5e9; color: #2e7d32; }
.status-badge.inactive { background: #f5f5f5; color: #999; }

.btn-link {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  margin-right: 8px;
  padding: 4px 8px;
}

.btn-link.danger { color: #e74c3c; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}

.modal-content h3 {
  margin: 0 0 20px;
  color: #1a1a2e;
}

.form-field {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 6px;
}

.form-field.checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-field.checkbox input {
  width: auto;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
}

.form-field textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-secondary {
  flex: 1;
  padding: 10px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.modal-actions .btn-primary {
  flex: 1;
}

.error-msg {
  color: #e74c3c;
  margin-top: 12px;
  text-align: center;
}
</style>
