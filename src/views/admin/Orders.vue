<template>
  <div class="admin-page">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>票种</th>
            <th>时段</th>
            <th>入园日期</th>
            <th>数量</th>
            <th>总金额</th>
            <th>状态</th>
            <th>下单时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td class="order-no">{{ order.orderNo }}</td>
            <td>{{ order.ticketTypeName }}</td>
            <td>{{ order.timeSlotName }}</td>
            <td>{{ order.visitDate }}</td>
            <td>{{ order.quantity }}</td>
            <td class="price">¥{{ order.totalAmount.toFixed(2) }}</td>
            <td>
              <span :class="['status-badge', `status-${order.status.toLowerCase()}`]">
                {{ order.statusName }}
              </span>
            </td>
            <td>{{ order.createTime }}</td>
            <td>
              <button @click="viewDetail(order)" class="btn-link">详情</button>
              <button 
                v-if="order.status === 'PENDING'" 
                @click="handleStatusChange(order, 'ENTERED')" 
                class="btn-link success"
              >
                入园
              </button>
              <button 
                v-if="order.status === 'PENDING'" 
                @click="handleRefund(order)" 
                class="btn-link danger"
              >
                退款
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

    <!-- Order Detail Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-content">
        <button class="modal-close" @click="closeDetail">×</button>
        <h3>订单详情</h3>
        
        <div class="detail-section">
          <div class="detail-row">
            <span class="label">订单号</span>
            <span class="value order-no">{{ selectedOrder.orderNo }}</span>
          </div>
          <div class="detail-row">
            <span class="label">订单状态</span>
            <span :class="['value', 'status-badge', `status-${selectedOrder.status.toLowerCase()}`]">
              {{ selectedOrder.statusName }}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <h4>票务信息</h4>
          <div class="detail-row">
            <span class="label">票种</span>
            <span class="value">{{ selectedOrder.ticketTypeName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">时段</span>
            <span class="value">{{ selectedOrder.timeSlotName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">入园日期</span>
            <span class="value">{{ selectedOrder.visitDate }}</span>
          </div>
          <div class="detail-row">
            <span class="label">数量</span>
            <span class="value">{{ selectedOrder.quantity }}张</span>
          </div>
          <div class="detail-row">
            <span class="label">单价</span>
            <span class="value">¥{{ selectedOrder.unitPrice.toFixed(2) }}</span>
          </div>
          <div class="detail-row total">
            <span class="label">总金额</span>
            <span class="value price">¥{{ selectedOrder.totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div v-if="selectedOrder.contactName || selectedOrder.contactPhone" class="detail-section">
          <h4>联系人信息</h4>
          <div v-if="selectedOrder.contactName" class="detail-row">
            <span class="label">姓名</span>
            <span class="value">{{ selectedOrder.contactName }}</span>
          </div>
          <div v-if="selectedOrder.contactPhone" class="detail-row">
            <span class="label">电话</span>
            <span class="value">{{ selectedOrder.contactPhone }}</span>
          </div>
          <div v-if="selectedOrder.contactIdCard" class="detail-row">
            <span class="label">身份证</span>
            <span class="value">{{ selectedOrder.contactIdCard }}</span>
          </div>
        </div>

        <div v-if="selectedOrder.status === 'PENDING' || selectedOrder.status === 'ENTERED'" class="detail-section">
          <h4>二维码</h4>
          <div class="qrcode-box">{{ selectedOrder.qrCode }}</div>
        </div>

        <div v-if="selectedOrder.cancelReason" class="detail-section">
          <h4>取消原因</h4>
          <p>{{ selectedOrder.cancelReason }}</p>
        </div>

        <div v-if="selectedOrder.refundReason" class="detail-section">
          <h4>退款原因</h4>
          <p>{{ selectedOrder.refundReason }}</p>
        </div>

        <div class="detail-section">
          <div class="detail-row">
            <span class="label">下单时间</span>
            <span class="value">{{ selectedOrder.createTime }}</span>
          </div>
          <div class="detail-row">
            <span class="label">更新时间</span>
            <span class="value">{{ selectedOrder.updateTime }}</span>
          </div>
        </div>

        <div v-if="selectedOrder.status === 'PENDING'" class="modal-actions">
          <select v-model="newStatus" class="status-select">
            <option value="">修改状态</option>
            <option value="ENTERED">已入园</option>
            <option value="EXPIRED">已过期</option>
            <option value="CANCELLED">已取消</option>
          </select>
          <button 
            @click="confirmStatusChange" 
            :disabled="!newStatus" 
            class="btn-primary"
          >
            确认修改
          </button>
        </div>
      </div>
    </div>

    <!-- Refund Modal -->
    <div v-if="refundingOrder" class="modal-overlay" @click.self="closeRefundModal">
      <div class="modal-content">
        <h3>订单退款</h3>
        <p>订单号：{{ refundingOrder.orderNo }}</p>
        <p>金额：¥{{ refundingOrder.totalAmount.toFixed(2) }}</p>
        <div class="form-field">
          <label>退款原因（选填）</label>
          <textarea v-model="refundReason" placeholder="请输入退款原因"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="closeRefundModal" class="btn-secondary">取消</button>
          <button @click="confirmRefund" :disabled="refunding" class="btn-primary">
            {{ refunding ? '处理中...' : '确认退款' }}
          </button>
        </div>
        <p v-if="refundError" class="error-msg">{{ refundError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminOrders, getAdminOrderById, updateOrderStatus, refundOrder } from '@/api/order'
import type { Order } from '@/types'

const orders = ref<Order[]>([])
const loading = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 10

const selectedOrder = ref<Order | null>(null)
const newStatus = ref('')

const refundingOrder = ref<Order | null>(null)
const refundReason = ref('')
const refunding = ref(false)
const refundError = ref('')

const loadOrders = async (page = 0) => {
  loading.value = true
  try {
    const res = await getAdminOrders(page, pageSize)
    orders.value = res.data.content
    totalPages.value = res.data.totalPages
    currentPage.value = res.data.number
  } catch (e) {
    console.error('Failed to load orders:', e)
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  loadOrders(page)
}

const viewDetail = async (order: Order) => {
  try {
    const res = await getAdminOrderById(order.id)
    selectedOrder.value = res.data
    newStatus.value = ''
  } catch (e) {
    console.error('Failed to load order detail:', e)
  }
}

const closeDetail = () => {
  selectedOrder.value = null
  newStatus.value = ''
}

const handleStatusChange = async (order: Order, status: string) => {
  if (!confirm(`确定要将订单状态修改为 ${status} 吗？`)) return
  
  try {
    await updateOrderStatus(order.id, status)
    loadOrders(currentPage.value)
  } catch (e) {
    console.error('Failed to update order status:', e)
  }
}

const confirmStatusChange = async () => {
  if (!selectedOrder.value || !newStatus.value) return
  
  try {
    await updateOrderStatus(selectedOrder.value.id, newStatus.value)
    closeDetail()
    loadOrders(currentPage.value)
  } catch (e) {
    console.error('Failed to update order status:', e)
  }
}

const handleRefund = (order: Order) => {
  refundingOrder.value = order
  refundReason.value = ''
  refundError.value = ''
}

const closeRefundModal = () => {
  refundingOrder.value = null
}

const confirmRefund = async () => {
  if (!refundingOrder.value) return
  
  refunding.value = true
  refundError.value = ''
  
  try {
    await refundOrder(refundingOrder.value.id, refundReason.value || undefined)
    closeRefundModal()
    loadOrders(currentPage.value)
  } catch (e: any) {
    refundError.value = e?.message || '退款失败'
  } finally {
    refunding.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.admin-page {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
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

.order-no {
  font-family: monospace;
  font-size: 12px;
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

.status-pending { background: #e3f2fd; color: #1565c0; }
.status-entered { background: #e8f5e9; color: #2e7d32; }
.status-expired { background: #f5f5f5; color: #757575; }
.status-cancelled { background: #fff3e0; color: #ef6c00; }
.status-refunded { background: #fce4ec; color: #c2185b; }

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

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h4 {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.detail-row .label {
  color: #999;
}

.detail-row .value {
  color: #333;
}

.detail-row.total {
  padding-top: 12px;
  border-top: 1px dashed #eee;
}

.qrcode-box {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.status-select {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.btn-primary {
  padding: 10px 20px;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  flex: 1;
  padding: 10px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
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

.form-field textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  min-height: 80px;
  resize: vertical;
}

.error-msg {
  color: #e74c3c;
  margin-top: 12px;
  text-align: center;
}
</style>
