<template>
  <div class="admin-page">
    <div class="filter-bar">
      <input 
        type="text" 
        v-model="usernameFilter" 
        placeholder="按用户名筛选"
        @keyup.enter="loadLogs(0)"
      />
      <button @click="loadLogs(0)" class="btn-primary">筛选</button>
      <button @click="clearFilter" class="btn-secondary">清除</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户</th>
            <th>操作类型</th>
            <th>描述</th>
            <th>请求路径</th>
            <th>IP地址</th>
            <th>操作时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ log.id }}</td>
            <td>{{ log.username }}</td>
            <td>
              <span class="operation-type">{{ log.operationType }}</span>
            </td>
            <td>{{ log.description }}</td>
            <td class="request-path">
              <span class="method">{{ log.requestMethod }}</span>
              {{ log.requestPath }}
            </td>
            <td>{{ log.ipAddress }}</td>
            <td>{{ log.operationTime }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="logs.length === 0" class="empty">暂无日志</div>

      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="currentPage === 0" @click="changePage(currentPage - 1)">上一页</button>
        <span>第 {{ currentPage + 1 }} / {{ totalPages }} 页</span>
        <button :disabled="currentPage >= totalPages - 1" @click="changePage(currentPage + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOperationLogs } from '@/api/admin'
import type { OperationLog } from '@/types'

const logs = ref<OperationLog[]>([])
const loading = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 20
const usernameFilter = ref('')

const loadLogs = async (page = 0) => {
  loading.value = true
  try {
    const res = await getOperationLogs(page, pageSize, usernameFilter.value || undefined)
    logs.value = res.data.content
    totalPages.value = res.data.totalPages
    currentPage.value = res.data.number
  } catch (e) {
    console.error('Failed to load logs:', e)
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  loadLogs(page)
}

const clearFilter = () => {
  usernameFilter.value = ''
  loadLogs(0)
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.admin-page {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-bar input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 200px;
}

.btn-primary {
  padding: 10px 20px;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
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

.operation-type {
  padding: 4px 8px;
  background: #e3f2fd;
  color: #1565c0;
  border-radius: 4px;
  font-size: 12px;
}

.request-path {
  font-family: monospace;
  font-size: 12px;
}

.method {
  display: inline-block;
  padding: 2px 6px;
  background: #667eea;
  color: #fff;
  border-radius: 4px;
  font-size: 10px;
  margin-right: 8px;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

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
</style>
