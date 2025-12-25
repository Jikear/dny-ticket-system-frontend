<template>
  <div class="admin-page">
    <div class="page-actions">
      <button @click="openCreateModal" class="btn-primary">+ 新增票种</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>票种名称</th>
            <th>价格</th>
            <th>每日限额</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in tickets" :key="ticket.id">
            <td>{{ ticket.id }}</td>
            <td>{{ ticket.name }}</td>
            <td class="price">¥{{ ticket.price.toFixed(2) }}</td>
            <td>{{ ticket.dailyQuota }}</td>
            <td>
              <span :class="['status-badge', ticket.status === 1 ? 'active' : 'inactive']">
                {{ ticket.status === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ ticket.createTime }}</td>
            <td>
              <button @click="openEditModal(ticket)" class="btn-link">编辑</button>
              <button @click="handleDelete(ticket)" class="btn-link danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ editingTicket ? '编辑票种' : '新增票种' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-field">
            <label>票种名称 *</label>
            <input type="text" v-model="form.name" required />
          </div>
          <div class="form-field">
            <label>描述</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>价格 *</label>
              <input type="number" v-model.number="form.price" required min="0" step="0.01" />
            </div>
            <div class="form-field">
              <label>每日限额 *</label>
              <input type="number" v-model.number="form.dailyQuota" required min="1" />
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
import { getAdminTicketTypes, createTicketType, updateTicketType, deleteTicketType } from '@/api/ticket'
import type { TicketType } from '@/types'

const tickets = ref<TicketType[]>([])
const loading = ref(true)
const showModal = ref(false)
const submitting = ref(false)
const error = ref('')
const editingTicket = ref<TicketType | null>(null)

const form = reactive({
  name: '',
  description: '',
  price: 0,
  dailyQuota: 100,
  status: 1
})

const loadTickets = async () => {
  loading.value = true
  try {
    const res = await getAdminTicketTypes()
    tickets.value = res.data
  } catch (e) {
    console.error('Failed to load tickets:', e)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingTicket.value = null
  form.name = ''
  form.description = ''
  form.price = 0
  form.dailyQuota = 100
  form.status = 1
  error.value = ''
  showModal.value = true
}

const openEditModal = (ticket: TicketType) => {
  editingTicket.value = ticket
  form.name = ticket.name
  form.description = ticket.description || ''
  form.price = ticket.price
  form.dailyQuota = ticket.dailyQuota
  form.status = ticket.status
  error.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTicket.value = null
}

const handleSubmit = async () => {
  submitting.value = true
  error.value = ''

  try {
    if (editingTicket.value) {
      await updateTicketType(editingTicket.value.id, {
        name: form.name,
        description: form.description || undefined,
        price: form.price,
        dailyQuota: form.dailyQuota,
        status: form.status
      })
    } else {
      await createTicketType({
        name: form.name,
        description: form.description || undefined,
        price: form.price,
        dailyQuota: form.dailyQuota,
        status: form.status
      })
    }
    closeModal()
    loadTickets()
  } catch (e: any) {
    error.value = e?.message || '操作失败'
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (ticket: TicketType) => {
  if (!confirm(`确定要删除票种 "${ticket.name}" 吗？`)) return
  
  try {
    await deleteTicketType(ticket.id)
    loadTickets()
  } catch (e: any) {
    alert(e?.message || '删除失败')
  }
}

onMounted(() => {
  loadTickets()
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

.price {
  color: #e74c3c;
  font-weight: 600;
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
