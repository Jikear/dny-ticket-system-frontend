<template>
  <div class="booking-page">
    <header class="page-header">
      <router-link to="/" class="back-link">← 返回首页</router-link>
      <h1>预约购票</h1>
    </header>

    <div class="booking-container">
      <div v-if="!userStore.username" class="login-notice">
        <p>请先登录后再进行预约</p>
        <router-link to="/login" class="login-btn">去登录</router-link>
      </div>
      
      <div v-else class="booking-form-container">
        <form @submit.prevent="handleSubmit" class="booking-form">
          <!-- Ticket Type Selection -->
          <div class="form-section">
            <h3>选择票种</h3>
            <div class="ticket-options">
              <label 
                v-for="ticket in ticketTypes" 
                :key="ticket.id" 
                :class="['ticket-option', { selected: form.ticketTypeId === ticket.id }]"
              >
                <input 
                  type="radio" 
                  :value="ticket.id" 
                  v-model="form.ticketTypeId"
                  required
                />
                <div class="ticket-info">
                  <span class="ticket-name">{{ ticket.name }}</span>
                  <span class="ticket-price">¥{{ ticket.price.toFixed(2) }}</span>
                  <span class="ticket-desc">{{ ticket.description }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Time Slot Selection -->
          <div class="form-section">
            <h3>选择时段</h3>
            <div class="slot-options">
              <label 
                v-for="slot in timeSlots" 
                :key="slot.id" 
                :class="['slot-option', { selected: form.timeSlotId === slot.id }]"
              >
                <input 
                  type="radio" 
                  :value="slot.id" 
                  v-model="form.timeSlotId"
                  required
                />
                <div class="slot-info">
                  <span class="slot-name">{{ slot.name }}</span>
                  <span class="slot-time">{{ slot.startTime?.substring(0, 5) }} - {{ slot.endTime?.substring(0, 5) }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Visit Date -->
          <div class="form-section">
            <h3>入园日期</h3>
            <input 
              type="date" 
              v-model="form.visitDate" 
              :min="minDate"
              required
              class="date-input"
            />
          </div>

          <!-- Quantity -->
          <div class="form-section">
            <h3>购买数量</h3>
            <div class="quantity-control">
              <button type="button" @click="decreaseQuantity" :disabled="form.quantity <= 1">-</button>
              <span>{{ form.quantity }}</span>
              <button type="button" @click="increaseQuantity" :disabled="form.quantity >= 10">+</button>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="form-section">
            <h3>联系人信息（选填）</h3>
            <div class="form-row">
              <div class="form-field">
                <label>联系人姓名</label>
                <input type="text" v-model="form.contactName" placeholder="请输入姓名" />
              </div>
              <div class="form-field">
                <label>联系电话</label>
                <input type="tel" v-model="form.contactPhone" placeholder="请输入手机号" />
              </div>
            </div>
            <div class="form-field">
              <label>身份证号</label>
              <input type="text" v-model="form.contactIdCard" placeholder="请输入身份证号" />
            </div>
          </div>

          <!-- Order Summary -->
          <div class="order-summary">
            <h3>订单信息</h3>
            <div class="summary-row">
              <span>票种：</span>
              <span>{{ selectedTicketType?.name || '-' }}</span>
            </div>
            <div class="summary-row">
              <span>时段：</span>
              <span>{{ selectedTimeSlot?.name || '-' }}</span>
            </div>
            <div class="summary-row">
              <span>日期：</span>
              <span>{{ form.visitDate || '-' }}</span>
            </div>
            <div class="summary-row">
              <span>数量：</span>
              <span>{{ form.quantity }}张</span>
            </div>
            <div class="summary-row total">
              <span>总计：</span>
              <span class="total-price">¥{{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="submitting">
            {{ submitting ? '提交中...' : '确认预约' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="orderResult" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content success-modal">
        <div class="success-icon">✓</div>
        <h2>预约成功</h2>
        <div class="order-info">
          <div class="info-row">
            <span>订单号：</span>
            <span class="order-no">{{ orderResult.orderNo }}</span>
          </div>
          <div class="info-row">
            <span>票种：</span>
            <span>{{ orderResult.ticketTypeName }}</span>
          </div>
          <div class="info-row">
            <span>时段：</span>
            <span>{{ orderResult.timeSlotName }}</span>
          </div>
          <div class="info-row">
            <span>入园日期：</span>
            <span>{{ orderResult.visitDate }}</span>
          </div>
          <div class="info-row">
            <span>数量：</span>
            <span>{{ orderResult.quantity }}张</span>
          </div>
          <div class="info-row total">
            <span>总金额：</span>
            <span>¥{{ orderResult.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
        <div class="qrcode-section">
          <p>入园二维码</p>
          <div class="qrcode-placeholder">{{ orderResult.qrCode }}</div>
        </div>
        <div class="modal-actions">
          <router-link to="/user/orders" class="view-orders-btn">查看我的订单</router-link>
          <button @click="closeModal" class="close-btn">继续预约</button>
        </div>
      </div>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { getTicketTypes, getTimeSlots } from '@/api/ticket'
import { createOrder } from '@/api/order'
import type { TicketType, TimeSlot, Order } from '@/types'

const userStore = useUserStore()

const ticketTypes = ref<TicketType[]>([])
const timeSlots = ref<TimeSlot[]>([])
const submitting = ref(false)
const error = ref('')
const orderResult = ref<Order | null>(null)

const form = reactive({
  ticketTypeId: 0,
  timeSlotId: 0,
  visitDate: '',
  quantity: 1,
  contactName: '',
  contactPhone: '',
  contactIdCard: ''
})

// Minimum date is tomorrow
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const selectedTicketType = computed(() => 
  ticketTypes.value.find(t => t.id === form.ticketTypeId)
)

const selectedTimeSlot = computed(() => 
  timeSlots.value.find(s => s.id === form.timeSlotId)
)

const totalAmount = computed(() => {
  const price = selectedTicketType.value?.price || 0
  return price * form.quantity
})

const decreaseQuantity = () => {
  if (form.quantity > 1) form.quantity--
}

const increaseQuantity = () => {
  if (form.quantity < 10) form.quantity++
}

const loadData = async () => {
  try {
    const [ticketRes, slotRes] = await Promise.all([
      getTicketTypes(),
      getTimeSlots()
    ])
    ticketTypes.value = ticketRes.data.filter(t => t.status === 1)
    timeSlots.value = slotRes.data.filter(s => s.status === 1)
  } catch (e) {
    console.error('Failed to load data:', e)
  }
}

const handleSubmit = async () => {
  error.value = ''
  submitting.value = true
  
  try {
    const res = await createOrder({
      ticketTypeId: form.ticketTypeId,
      timeSlotId: form.timeSlotId,
      visitDate: form.visitDate,
      quantity: form.quantity,
      contactName: form.contactName || undefined,
      contactPhone: form.contactPhone || undefined,
      contactIdCard: form.contactIdCard || undefined
    })
    orderResult.value = res.data
    // Reset form
    form.ticketTypeId = 0
    form.timeSlotId = 0
    form.visitDate = ''
    form.quantity = 1
    form.contactName = ''
    form.contactPhone = ''
    form.contactIdCard = ''
  } catch (e: any) {
    error.value = e?.message || '预约失败，请重试'
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  orderResult.value = null
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.booking-page {
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

.booking-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 20px;
}

.login-notice {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
}

.login-notice p {
  color: #666;
  margin-bottom: 16px;
}

.login-btn {
  display: inline-block;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.booking-form {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  margin: 0 0 16px;
  color: #1a1a2e;
  font-size: 16px;
}

.ticket-options, .slot-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.ticket-option, .slot-option {
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.ticket-option:hover, .slot-option:hover {
  border-color: #10b981;
}

.ticket-option.selected, .slot-option.selected {
  border-color: #10b981;
  background: #ecfdf5;
}

.ticket-option input, .slot-option input {
  display: none;
}

.ticket-info, .slot-info {
  display: flex;
  flex-direction: column;
}

.ticket-name, .slot-name {
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.ticket-price {
  color: #e74c3c;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.ticket-desc, .slot-time {
  color: #666;
  font-size: 14px;
}

.date-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 16px;
}

.date-input:focus {
  outline: none;
  border-color: #10b981;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quantity-control button {
  width: 40px;
  height: 40px;
  border: 2px solid #eee;
  background: #fff;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-control span {
  font-size: 20px;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field {
  margin-bottom: 12px;
}

.form-field label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 6px;
}

.form-field input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #eee;
  border-radius: 6px;
  box-sizing: border-box;
}

.form-field input:focus {
  outline: none;
  border-color: #10b981;
}

.order-summary {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.order-summary h3 {
  margin: 0 0 16px;
  color: #1a1a2e;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.summary-row.total {
  border-bottom: none;
  padding-top: 16px;
  font-weight: 600;
}

.total-price {
  color: #e74c3c;
  font-size: 20px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.submit-btn:disabled {
  background: #ccc;
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
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
}

.success-modal {
  text-align: center;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #4caf50;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 16px;
}

.success-modal h2 {
  margin: 0 0 24px;
  color: #1a1a2e;
}

.order-info {
  text-align: left;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.info-row.total {
  border-top: 1px solid #eee;
  margin-top: 8px;
  padding-top: 12px;
  font-weight: 600;
}

.order-no {
  font-family: monospace;
  color: #10b981;
}

.qrcode-section {
  margin-bottom: 20px;
}

.qrcode-section p {
  color: #666;
  margin-bottom: 8px;
}

.qrcode-placeholder {
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
}

.view-orders-btn {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.close-btn {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.error-message {
  text-align: center;
  color: #e74c3c;
  margin-top: 16px;
}
</style>
