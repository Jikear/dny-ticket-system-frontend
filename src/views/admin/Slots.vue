<template>
  <div class="admin-page">
    <div class="page-actions">
      <button @click="openCreateModal" class="btn-primary">+ 新增时段</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>时段名称</th>
            <th>开始时间</th>
            <th>结束时间</th>
            <th>可预约数量</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slot in slots" :key="slot.id">
            <td>{{ slot.id }}</td>
            <td>{{ slot.name }}</td>
            <td>{{ slot.startTime?.substring(0, 5) }}</td>
            <td>{{ slot.endTime?.substring(0, 5) }}</td>
            <td>{{ slot.quota }}</td>
            <td>
              <span :class="['status-badge', slot.status === 1 ? 'active' : 'inactive']">
                {{ slot.status === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ slot.createTime }}</td>
            <td>
              <button @click="openEditModal(slot)" class="btn-link">编辑</button>
              <button @click="handleDelete(slot)" class="btn-link danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ editingSlot ? '编辑时段' : '新增时段' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-field">
            <label>时段名称 *</label>
            <input type="text" v-model="form.name" required />
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>开始时间 *</label>
              <input type="time" v-model="form.startTime" required />
            </div>
            <div class="form-field">
              <label>结束时间 *</label>
              <input type="time" v-model="form.endTime" required />
            </div>
          </div>
          <div class="form-field">
            <label>可预约数量 *</label>
            <input type="number" v-model.number="form.quota" required min="1" />
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
import { getAdminTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot } from '@/api/ticket'
import type { TimeSlot } from '@/types'

const slots = ref<TimeSlot[]>([])
const loading = ref(true)
const showModal = ref(false)
const submitting = ref(false)
const error = ref('')
const editingSlot = ref<TimeSlot | null>(null)

const form = reactive({
  name: '',
  startTime: '09:00',
  endTime: '12:00',
  quota: 500,
  status: 1
})

const loadSlots = async () => {
  loading.value = true
  try {
    const res = await getAdminTimeSlots()
    slots.value = res.data
  } catch (e) {
    console.error('Failed to load slots:', e)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingSlot.value = null
  form.name = ''
  form.startTime = '09:00'
  form.endTime = '12:00'
  form.quota = 500
  form.status = 1
  error.value = ''
  showModal.value = true
}

const openEditModal = (slot: TimeSlot) => {
  editingSlot.value = slot
  form.name = slot.name
  form.startTime = slot.startTime?.substring(0, 5) || '09:00'
  form.endTime = slot.endTime?.substring(0, 5) || '12:00'
  form.quota = slot.quota
  form.status = slot.status
  error.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingSlot.value = null
}

const handleSubmit = async () => {
  submitting.value = true
  error.value = ''

  try {
    const data = {
      name: form.name,
      startTime: form.startTime + ':00',
      endTime: form.endTime + ':00',
      quota: form.quota,
      status: form.status
    }
    
    if (editingSlot.value) {
      await updateTimeSlot(editingSlot.value.id, data)
    } else {
      await createTimeSlot(data)
    }
    closeModal()
    loadSlots()
  } catch (e: any) {
    error.value = e?.message || '操作失败'
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (slot: TimeSlot) => {
  if (!confirm(`确定要删除时段 "${slot.name}" 吗？`)) return
  
  try {
    await deleteTimeSlot(slot.id)
    loadSlots()
  } catch (e: any) {
    alert(e?.message || '删除失败')
  }
}

onMounted(() => {
  loadSlots()
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
  max-width: 500px;
  width: 90%;
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
.form-field select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
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
