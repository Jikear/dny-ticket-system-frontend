<template>
  <div class="user-page">
    <header class="page-header">
      <router-link to="/" class="back-link">← 返回首页</router-link>
      <h1>我的订单</h1>
    </header>

    <div class="user-container">
      <div class="sidebar">
        <router-link to="/user/profile" class="menu-item">个人信息</router-link>
        <router-link to="/user/orders" class="menu-item active">我的订单</router-link>
        <router-link to="/user/password" class="menu-item">修改密码</router-link>
      </div>

      <div class="content">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="orders.length === 0" class="empty">暂无订单</div>
        <div v-else class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-header">
              <span class="order-no">订单号：{{ order.orderNo }}</span>
              <span :class="['order-status', `status-${order.status.toLowerCase()}`]">
                {{ order.statusName }}
              </span>
            </div>
            <div class="order-body">
              <div class="order-info">
                <div class="info-item">
                  <span class="label">票种：</span>
                  <span class="value">{{ order.ticketTypeName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">时段：</span>
                  <span class="value">{{ order.timeSlotName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">入园日期：</span>
                  <span class="value">{{ order.visitDate }}</span>
                </div>
                <div class="info-item">
                  <span class="label">数量：</span>
                  <span class="value">{{ order.quantity }}张</span>
                </div>
              </div>
              <div class="order-price">
                <span class="price-label">总金额</span>
                <span class="price-value">¥{{ order.totalAmount.toFixed(2) }}</span>
              </div>
            </div>
            <div class="order-footer">
              <span class="create-time">下单时间：{{ order.createTime }}</span>
              <div class="order-actions">
                <button @click="viewDetail(order)" class="btn-detail">查看详情</button>
                <button 
                  v-if="order.status === 'PENDING'" 
                  @click="handleCancel(order)" 
                  class="btn-cancel"
                >
                  取消订单
                </button>
              </div>
            </div>
          </div>

          <div v-if="totalPages > 1" class="pagination">
            <button :disabled="currentPage === 0" @click="changePage(currentPage - 1)">上一页</button>
            <span>第 {{ currentPage + 1 }} / {{ totalPages }} 页</span>
            <button :disabled="currentPage >= totalPages - 1" @click="changePage(currentPage + 1)">下一页</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-content">
        <button class="modal-close" @click="closeDetail">×</button>
        <h2>订单详情</h2>
        
        <div class="detail-section">
          <div class="detail-row">
            <span class="detail-label">订单号</span>
            <span class="detail-value order-no">{{ selectedOrder.orderNo }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">订单状态</span>
            <span :class="['detail-value', 'order-status', `status-${selectedOrder.status.toLowerCase()}`]">
              {{ selectedOrder.statusName }}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <h4>票务信息</h4>
          <div class="detail-row">
            <span class="detail-label">票种</span>
            <span class="detail-value">{{ selectedOrder.ticketTypeName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">时段</span>
            <span class="detail-value">{{ selectedOrder.timeSlotName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">入园日期</span>
            <span class="detail-value">{{ selectedOrder.visitDate }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">数量</span>
            <span class="detail-value">{{ selectedOrder.quantity }}张</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">单价</span>
            <span class="detail-value">¥{{ selectedOrder.unitPrice.toFixed(2) }}</span>
          </div>
          <div class="detail-row total">
            <span class="detail-label">总金额</span>
            <span class="detail-value price">¥{{ selectedOrder.totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div v-if="selectedOrder.contactName || selectedOrder.contactPhone" class="detail-section">
          <h4>联系人信息</h4>
          <div v-if="selectedOrder.contactName" class="detail-row">
            <span class="detail-label">姓名</span>
            <span class="detail-value">{{ selectedOrder.contactName }}</span>
          </div>
          <div v-if="selectedOrder.contactPhone" class="detail-row">
            <span class="detail-label">电话</span>
            <span class="detail-value">{{ selectedOrder.contactPhone }}</span>
          </div>
          <div v-if="selectedOrder.contactIdCard" class="detail-row">
            <span class="detail-label">身份证</span>
            <span class="detail-value">{{ selectedOrder.contactIdCard }}</span>
          </div>
        </div>

        <div v-if="selectedOrder.status === 'PENDING'" class="qrcode-section">
          <h4>入园二维码</h4>
          <div class="qrcode-box">
            <img v-if="qrCodeBase64" :src="`data:image/png;base64,${qrCodeBase64}`" alt="入园二维码" class="qrcode-img" />
            <span v-else-if="qrCodeError" class="qrcode-loading">二维码加载失败</span>
            <span v-else class="qrcode-loading">加载中...</span>
          </div>
          <p class="qrcode-tip">请在入园时出示此二维码</p>
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
            <span class="detail-label">下单时间</span>
            <span class="detail-value">{{ selectedOrder.createTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation -->
    <div v-if="cancellingOrder" class="modal-overlay" @click.self="closeCancelModal">
      <div class="modal-content cancel-modal">
        <h3>确认取消订单</h3>
        <p>订单号：{{ cancellingOrder.orderNo }}</p>
        <div class="form-field">
          <label>取消原因（选填）</label>
          <textarea v-model="cancelReason" placeholder="请输入取消原因"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="closeCancelModal" class="btn-secondary">取消</button>
          <button @click="confirmCancel" :disabled="cancelling" class="btn-primary">
            {{ cancelling ? '处理中...' : '确认取消' }}
          </button>
        </div>
        <p v-if="cancelError" class="error-msg">{{ cancelError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMyOrders, getOrderById, cancelOrder, getOrderQrCode } from '@/api/order'
import type { Order } from '@/types'

const orders = ref<Order[]>([])
const loading = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 10

const selectedOrder = ref<Order | null>(null)
const qrCodeBase64 = ref('')
const qrCodeError = ref(false)
const cancellingOrder = ref<Order | null>(null)
const cancelReason = ref('')
const cancelling = ref(false)
const cancelError = ref('')

const loadOrders = async (page = 0) => {
  loading.value = true
  try {
    const res = await getMyOrders(page, pageSize)
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
    const res = await getOrderById(order.id)
    selectedOrder.value = res.data
    qrCodeBase64.value = ''
    qrCodeError.value = false
    if (res.data.status === 'PENDING') {
      try {
        const qrRes = await getOrderQrCode(order.id)
        qrCodeBase64.value = qrRes.data.qrCodeBase64
      } catch (e) {
        console.error('Failed to load QR code:', e)
        qrCodeError.value = true
      }
    }
  } catch (e) {
    console.error('Failed to load order detail:', e)
  }
}

const closeDetail = () => {
  selectedOrder.value = null
  qrCodeBase64.value = ''
  qrCodeError.value = false
}

const handleCancel = (order: Order) => {
  cancellingOrder.value = order
  cancelReason.value = ''
  cancelError.value = ''
}

const closeCancelModal = () => {
  cancellingOrder.value = null
}

const confirmCancel = async () => {
  if (!cancellingOrder.value) return
  
  cancelling.value = true
  cancelError.value = ''
  
  try {
    await cancelOrder(cancellingOrder.value.id, cancelReason.value || undefined)
    closeCancelModal()
    loadOrders(currentPage.value)
  } catch (e: any) {
    cancelError.value = e?.message || '取消失败'
  } finally {
    cancelling.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.user-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  background: #fff;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-link {
  color: #10b981;
  text-decoration: none;
  font-size: 14px;
}

.page-header h1 {
  margin: 12px 0 0;
  color: #1a1a2e;
}

.user-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  gap: 24px;
}

.sidebar {
  width: 200px;
  background: #fff;
  border-radius: 8px;
  padding: 8px;
  height: fit-content;
}

.menu-item {
  display: block;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  border-radius: 6px;
  margin-bottom: 4px;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.active {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: #fff;
}

.content {
  flex: 1;
}

.loading, .empty {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  color: #666;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.order-no {
  font-family: monospace;
  color: #666;
  font-size: 14px;
}

.order-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: #e3f2fd;
  color: #1565c0;
}

.status-entered {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-expired {
  background: #f5f5f5;
  color: #757575;
}

.status-cancelled {
  background: #fff3e0;
  color: #ef6c00;
}

.status-refunded {
  background: #fce4ec;
  color: #c2185b;
}

.order-body {
  display: flex;
  justify-content: space-between;
  padding: 16px;
}

.order-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  font-size: 14px;
}

.info-item .label {
  color: #999;
}

.info-item .value {
  color: #333;
}

.order-price {
  text-align: right;
}

.price-label {
  display: block;
  color: #999;
  font-size: 12px;
}

.price-value {
  font-size: 24px;
  color: #e74c3c;
  font-weight: 700;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #eee;
}

.create-time {
  color: #999;
  font-size: 14px;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.btn-detail, .btn-cancel {
  padding: 6px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.btn-detail {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: #fff;
}

.btn-cancel {
  background: #fff;
  color: #e74c3c;
  border: 1px solid #e74c3c;
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
  max-width: 500px;
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

.modal-content h2 {
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
  margin-bottom: 0;
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

.detail-label {
  color: #999;
}

.detail-value {
  color: #333;
}

.detail-value.price {
  color: #e74c3c;
  font-size: 18px;
  font-weight: 700;
}

.detail-row.total {
  padding-top: 12px;
  border-top: 1px dashed #eee;
}

.qrcode-section {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  margin-bottom: 20px;
}

.qrcode-section h4 {
  margin: 0 0 12px;
  color: #333;
}

.qrcode-box {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.qrcode-img {
  width: 200px;
  height: 200px;
  display: block;
}

.qrcode-loading {
  color: #999;
  font-size: 14px;
}

.qrcode-tip {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}

.cancel-modal {
  max-width: 400px;
}

.cancel-modal h3 {
  margin: 0 0 8px;
  color: #1a1a2e;
}

.cancel-modal > p {
  color: #666;
  margin-bottom: 16px;
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

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary, .btn-primary {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-primary {
  background: #e74c3c;
  color: #fff;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-msg {
  color: #e74c3c;
  margin-top: 12px;
  text-align: center;
}
</style>
