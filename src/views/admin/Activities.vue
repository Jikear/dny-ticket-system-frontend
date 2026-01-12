<template>
  <div class="admin-page">
    <div class="page-actions">
      <button @click="openCreateModal" class="btn-primary">+ 新增活动</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>活动名称</th>
            <th>地点</th>
            <th>每日时间</th>
            <th>日期范围</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in activities" :key="activity.id">
            <td>{{ activity.id }}</td>
            <td>{{ activity.name }}</td>
            <td>{{ activity.location || '-' }}</td>
            <td>
              {{ activity.dailyStartTime && activity.dailyEndTime ? `${activity.dailyStartTime.substring(0, 5)} - ${activity.dailyEndTime.substring(0, 5)}` : '-' }}
            </td>
            <td>
              {{ activity.startDate && activity.endDate ? `${activity.startDate} ~ ${activity.endDate}` : '-' }}
            </td>
            <td>
              <span :class="['status-badge', activity.status === 1 ? 'active' : 'inactive']">
                {{ activity.status === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <button @click="openEditModal(activity)" class="btn-link">编辑</button>
              <button @click="handleDelete(activity)" class="btn-link danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ editingActivity ? '编辑活动' : '新增活动' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-field">
            <label>活动名称 *</label>
            <input type="text" v-model="form.name" required />
          </div>
          <div class="form-field">
            <label>描述</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>
          <div class="form-field">
            <label>封面图</label>
            <div class="image-upload">
              <input
                type="file"
                ref="imageFileInput"
                accept="image/jpeg,image/png,image/gif"
                @change="handleImageFileChange"
                style="display: none"
              />
              <div class="upload-preview" v-if="form.imageUrl">
                <img :src="form.imageUrl" alt="封面图预览" class="preview-image" />
              </div>
              <div class="upload-actions">
                <button type="button" @click="triggerImageUpload" class="btn-upload" :disabled="uploading">
                  {{ uploading ? '上传中...' : '上传图片' }}
                </button>
                <span class="upload-hint">支持 jpg/png/gif，最大10MB</span>
              </div>
              <input type="url" v-model="form.imageUrl" placeholder="或输入图片URL" class="url-input" />
            </div>
          </div>
          <div class="form-field">
            <label>地点</label>
            <input type="text" v-model="form.location" />
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>开始日期</label>
              <input type="date" v-model="form.startDate" />
            </div>
            <div class="form-field">
              <label>结束日期</label>
              <input type="date" v-model="form.endDate" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>每日开始时间</label>
              <input type="time" v-model="form.dailyStartTime" />
            </div>
            <div class="form-field">
              <label>每日结束时间</label>
              <input type="time" v-model="form.dailyEndTime" />
            </div>
          </div>
          <div class="form-field">
            <label>状态</label>
            <select v-model.number="form.status">
              <option :value="1">启用</option>
              <option :value="0">禁用</option>
            </select>
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
import { ref, reactive, onMounted } from 'vue'
import { getAdminActivities, createActivity, updateActivity, deleteActivity } from '@/api/park'
import { uploadImage } from '@/api/upload'
import type { Activity } from '@/types'

const activities = ref<Activity[]>([])
const loading = ref(true)
const showModal = ref(false)
const submitting = ref(false)
const uploading = ref(false)
const error = ref('')
const editingActivity = ref<Activity | null>(null)
const imageFileInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  name: '',
  description: '',
  imageUrl: '',
  location: '',
  startDate: '',
  endDate: '',
  dailyStartTime: '',
  dailyEndTime: '',
  status: 1
})

const triggerImageUpload = () => {
  imageFileInput.value?.click()
}

const handleImageFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validate file type
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
    error.value = '只能上传图片文件（jpg/png/gif）'
    return
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    error.value = '图片大小不能超过10MB'
    return
  }

  uploading.value = true
  error.value = ''

  try {
    const res = await uploadImage(file)
    form.imageUrl = res.data.url
  } catch (e: any) {
    error.value = e?.message || '上传失败'
  } finally {
    uploading.value = false
    // Reset file input
    if (target) target.value = ''
  }
}

const loadActivities = async () => {
  loading.value = true
  try {
    const res = await getAdminActivities()
    activities.value = res.data
  } catch (e) {
    console.error('Failed to load activities:', e)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingActivity.value = null
  form.name = ''
  form.description = ''
  form.imageUrl = ''
  form.location = ''
  form.startDate = ''
  form.endDate = ''
  form.dailyStartTime = ''
  form.dailyEndTime = ''
  form.status = 1
  error.value = ''
  showModal.value = true
}

const openEditModal = (activity: Activity) => {
  editingActivity.value = activity
  form.name = activity.name
  form.description = activity.description || ''
  form.imageUrl = activity.imageUrl || ''
  form.location = activity.location || ''
  form.startDate = activity.startDate || ''
  form.endDate = activity.endDate || ''
  form.dailyStartTime = activity.dailyStartTime?.substring(0, 5) || ''
  form.dailyEndTime = activity.dailyEndTime?.substring(0, 5) || ''
  form.status = activity.status
  error.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingActivity.value = null
}

const handleSubmit = async () => {
  submitting.value = true
  error.value = ''

  try {
    const data = {
      name: form.name,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      location: form.location || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      dailyStartTime: form.dailyStartTime ? form.dailyStartTime + ':00' : undefined,
      dailyEndTime: form.dailyEndTime ? form.dailyEndTime + ':00' : undefined,
      status: form.status
    }
    
    if (editingActivity.value) {
      await updateActivity(editingActivity.value.id, data)
    } else {
      await createActivity(data)
    }
    closeModal()
    loadActivities()
  } catch (e: any) {
    error.value = e?.message || '操作失败'
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (activity: Activity) => {
  if (!confirm(`确定要删除活动 "${activity.name}" 吗？`)) return
  
  try {
    await deleteActivity(activity.id)
    loadActivities()
  } catch (e: any) {
    alert(e?.message || '删除失败')
  }
}

onMounted(() => {
  loadActivities()
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

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-preview {
  width: 200px;
  height: 150px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.upload-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-upload {
  padding: 8px 16px;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-upload:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.upload-hint {
  color: #999;
  font-size: 12px;
}

.url-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
}

.url-input:focus {
  outline: none;
  border-color: #667eea;
}

.error-msg {
  color: #e74c3c;
  margin-top: 12px;
  text-align: center;
}
</style>
