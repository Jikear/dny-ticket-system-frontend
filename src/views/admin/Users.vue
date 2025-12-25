<template>
  <div class="admin-page">
    <div class="page-actions">
      <button @click="showCreateModal = true" class="btn-primary">+ 创建工作人员</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>昵称</th>
            <th>手机号</th>
            <th>角色</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.nickname || '-' }}</td>
            <td>{{ user.phone || '-' }}</td>
            <td>
              <span :class="['role-badge', `role-${user.role.toLowerCase()}`]">
                {{ roleText(user.role) }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', user.status === 1 ? 'active' : 'inactive']">
                {{ user.status === 1 ? '正常' : '已冻结' }}
              </span>
            </td>
            <td>{{ user.createTime }}</td>
            <td>
              <button @click="viewDetail(user)" class="btn-link">详情</button>
              <button 
                @click="toggleStatus(user)" 
                :class="['btn-link', user.status === 1 ? 'danger' : 'success']"
              >
                {{ user.status === 1 ? '冻结' : '解冻' }}
              </button>
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

    <!-- Create Staff Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal-content">
        <h3>创建工作人员</h3>
        <form @submit.prevent="handleCreate">
          <div class="form-field">
            <label>用户名 *</label>
            <input type="text" v-model="createForm.username" required />
          </div>
          <div class="form-field">
            <label>密码 *</label>
            <input type="password" v-model="createForm.password" required />
          </div>
          <div class="form-field">
            <label>昵称</label>
            <input type="text" v-model="createForm.nickname" />
          </div>
          <div class="form-field">
            <label>角色</label>
            <select v-model="createForm.role">
              <option value="STAFF">工作人员</option>
              <option value="ADMIN">管理员</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeCreateModal" class="btn-secondary">取消</button>
            <button type="submit" :disabled="creating" class="btn-primary">
              {{ creating ? '创建中...' : '创建' }}
            </button>
          </div>
          <p v-if="createError" class="error-msg">{{ createError }}</p>
        </form>
      </div>
    </div>

    <!-- User Detail Modal -->
    <div v-if="selectedUser" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-content">
        <button class="modal-close" @click="closeDetail">×</button>
        <h3>用户详情</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">ID</span>
            <span class="value">{{ selectedUser.id }}</span>
          </div>
          <div class="detail-item">
            <span class="label">用户名</span>
            <span class="value">{{ selectedUser.username }}</span>
          </div>
          <div class="detail-item">
            <span class="label">昵称</span>
            <span class="value">{{ selectedUser.nickname || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">真实姓名</span>
            <span class="value">{{ selectedUser.realName || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">身份证</span>
            <span class="value">{{ selectedUser.idCard || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">手机号</span>
            <span class="value">{{ selectedUser.phone || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">邮箱</span>
            <span class="value">{{ selectedUser.email || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">地区</span>
            <span class="value">{{ selectedUser.region || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">角色</span>
            <span class="value">{{ roleText(selectedUser.role) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">状态</span>
            <span class="value">{{ selectedUser.status === 1 ? '正常' : '已冻结' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">注册时间</span>
            <span class="value">{{ selectedUser.createTime }}</span>
          </div>
          <div class="detail-item">
            <span class="label">更新时间</span>
            <span class="value">{{ selectedUser.updateTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getAdminUsers, getAdminUserById, toggleUserStatus, createStaffUser } from '@/api/admin'
import type { User } from '@/types'

const users = ref<User[]>([])
const loading = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 10

const selectedUser = ref<User | null>(null)
const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')

const createForm = reactive({
  username: '',
  password: '',
  nickname: '',
  role: 'STAFF'
})

const roleText = (role: string) => {
  switch (role) {
    case 'ADMIN': return '管理员'
    case 'STAFF': return '工作人员'
    case 'USER': return '普通用户'
    default: return role
  }
}

const loadUsers = async (page = 0) => {
  loading.value = true
  try {
    const res = await getAdminUsers(page, pageSize)
    users.value = res.data.content
    totalPages.value = res.data.totalPages
    currentPage.value = res.data.number
  } catch (e) {
    console.error('Failed to load users:', e)
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  loadUsers(page)
}

const viewDetail = async (user: User) => {
  try {
    const res = await getAdminUserById(user.id)
    selectedUser.value = res.data
  } catch (e) {
    console.error('Failed to load user detail:', e)
  }
}

const closeDetail = () => {
  selectedUser.value = null
}

const toggleStatus = async (user: User) => {
  const action = user.status === 1 ? '冻结' : '解冻'
  if (!confirm(`确定要${action}用户 ${user.username} 吗？`)) return
  
  try {
    await toggleUserStatus(user.id)
    loadUsers(currentPage.value)
  } catch (e) {
    console.error('Failed to toggle user status:', e)
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  createForm.username = ''
  createForm.password = ''
  createForm.nickname = ''
  createForm.role = 'STAFF'
  createError.value = ''
}

const handleCreate = async () => {
  creating.value = true
  createError.value = ''
  
  try {
    await createStaffUser({
      username: createForm.username,
      password: createForm.password,
      nickname: createForm.nickname || undefined,
      role: createForm.role
    })
    closeCreateModal()
    loadUsers(currentPage.value)
  } catch (e: any) {
    createError.value = e?.message || '创建失败'
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  loadUsers()
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

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.role-admin { background: #fce4ec; color: #c2185b; }
.role-staff { background: #e3f2fd; color: #1565c0; }
.role-user { background: #f5f5f5; color: #666; }

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge.active { background: #e8f5e9; color: #2e7d32; }
.status-badge.inactive { background: #ffebee; color: #c62828; }

.btn-link {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  margin-right: 8px;
  padding: 4px 8px;
}

.btn-link.danger { color: #e74c3c; }
.btn-link.success { color: #4caf50; }

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
  max-width: 500px;
  width: 90%;
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

.modal-content h3 {
  margin: 0 0 20px;
  color: #1a1a2e;
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

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item .label {
  color: #999;
  font-size: 12px;
  margin-bottom: 4px;
}

.detail-item .value {
  color: #333;
}
</style>
