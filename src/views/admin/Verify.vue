<template>
  <div class="admin-page">
    <div class="verify-section">
      <h3>扫码核销</h3>
      <p class="verify-desc">请输入二维码内容或扫描入园二维码进行核销</p>
      <div class="verify-input-row">
        <input
          v-model="qrCode"
          type="text"
          placeholder="请输入或扫描二维码内容，如 TICKET:T20240101120000ABCD1234"
          class="verify-input"
          @keyup.enter="handleVerify"
        />
        <button @click="startScan" :disabled="scanning" class="btn-scan" title="扫描二维码">
          📷 扫码
        </button>
        <button @click="handleVerify" :disabled="verifying || !qrCode.trim()" class="btn-primary">
          {{ verifying ? '核销中...' : '核销' }}
        </button>
      </div>
    </div>

    <!-- QR Scanner Modal -->
    <div v-if="scanning" class="scanner-overlay" @click.self="stopScan">
      <div class="scanner-modal">
        <div class="scanner-header">
          <h3>扫描二维码</h3>
          <button @click="stopScan" class="scanner-close">&times;</button>
        </div>
        <div id="qr-reader" class="scanner-view"></div>
        <p class="scanner-tip">请将二维码对准摄像头进行扫描</p>
      </div>
    </div>

    <!-- Verify Result -->
    <div v-if="verifyResult" class="result-section success-result">
      <div class="result-icon success-icon">✓</div>
      <h3>核销成功</h3>
      <div class="result-detail">
        <div class="detail-row">
          <span class="label">订单号</span>
          <span class="value order-no">{{ verifyResult.orderNo }}</span>
        </div>
        <div class="detail-row">
          <span class="label">状态</span>
          <span class="value status-badge status-entered">{{ verifyResult.statusName }}</span>
        </div>
        <div class="detail-row">
          <span class="label">票种</span>
          <span class="value">{{ verifyResult.ticketTypeName }}</span>
        </div>
        <div class="detail-row">
          <span class="label">时段</span>
          <span class="value">{{ verifyResult.timeSlotName }}</span>
        </div>
        <div class="detail-row">
          <span class="label">入园日期</span>
          <span class="value">{{ verifyResult.visitDate }}</span>
        </div>
        <div class="detail-row">
          <span class="label">数量</span>
          <span class="value">{{ verifyResult.quantity }}张</span>
        </div>
        <div class="detail-row">
          <span class="label">总金额</span>
          <span class="value price">¥{{ verifyResult.totalAmount.toFixed(2) }}</span>
        </div>
        <div v-if="verifyResult.contactName" class="detail-row">
          <span class="label">联系人</span>
          <span class="value">{{ verifyResult.contactName }}</span>
        </div>
        <div v-if="verifyResult.contactPhone" class="detail-row">
          <span class="label">联系电话</span>
          <span class="value">{{ verifyResult.contactPhone }}</span>
        </div>
      </div>
      <button @click="resetResult" class="btn-secondary reset-btn">继续核销</button>
    </div>

    <!-- Verify Rules -->
    <div class="rules-section">
      <h3>核销规则</h3>
      <ul class="rules-list">
        <li>只有状态为 <strong>待入园</strong> 的订单才能核销</li>
        <li>入园日期必须是今天或未来的日期</li>
        <li>核销成功后，订单状态变更为 <strong>已入园</strong></li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { verifyOrder } from '@/api/order'
import { showSuccess, showError } from '@/utils/toast'
import type { Order } from '@/types'

const qrCode = ref('')
const verifying = ref(false)
const verifyResult = ref<Order | null>(null)
const scanning = ref(false)

let html5QrCode: Html5Qrcode | null = null

const handleVerify = async () => {
  if (!qrCode.value.trim() || verifying.value) return

  verifying.value = true
  verifyResult.value = null

  try {
    const res = await verifyOrder(qrCode.value.trim())
    verifyResult.value = res.data
    showSuccess('核销成功')
  } catch (e) {
    // Error toast is handled by the global interceptor
    console.error('Verification failed:', e)
  } finally {
    verifying.value = false
  }
}

const startScan = async () => {
  scanning.value = true
  await nextTick()

  try {
    html5QrCode = new Html5Qrcode('qr-reader')
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        qrCode.value = decodedText
        stopScan()
        handleVerify()
      },
      () => {
        // Ignore scan failures (no QR code detected in frame)
      }
    )
  } catch (err) {
    console.error('Failed to start scanner:', err)
    showError('无法启动摄像头，请检查设备权限或使用手动输入')
    scanning.value = false
  }
}

const stopScan = async () => {
  if (html5QrCode) {
    try {
      await html5QrCode.stop()
      html5QrCode.clear()
    } catch {
      // Ignore stop errors
    }
    html5QrCode = null
  }
  scanning.value = false
}

const resetResult = () => {
  verifyResult.value = null
  qrCode.value = ''
}

onBeforeUnmount(() => {
  stopScan()
})
</script>

<style scoped>
.admin-page {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

.verify-section {
  margin-bottom: 32px;
}

.verify-section h3 {
  margin: 0 0 8px;
  color: #1a1a2e;
}

.verify-desc {
  color: #666;
  font-size: 14px;
  margin: 0 0 16px;
}

.verify-input-row {
  display: flex;
  gap: 12px;
}

.verify-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.verify-input:focus {
  outline: none;
  border-color: #10b981;
}

.result-section {
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 32px;
  text-align: center;
}

.success-result {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.result-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 12px;
}

.success-icon {
  background: #4caf50;
  color: #fff;
}

.result-section h3 {
  margin: 0 0 20px;
  color: #1a1a2e;
}

.result-detail {
  text-align: left;
  max-width: 400px;
  margin: 0 auto 20px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: #999;
}

.detail-row .value {
  color: #333;
  font-weight: 500;
}

.order-no {
  font-family: monospace;
  color: #10b981 !important;
}

.price {
  color: #e74c3c !important;
  font-weight: 600 !important;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-entered {
  background: #e8f5e9;
  color: #2e7d32;
}

.reset-btn {
  margin-top: 8px;
  padding: 10px 32px;
}

.rules-section {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.rules-section h3 {
  margin: 0 0 12px;
  color: #1a1a2e;
  font-size: 16px;
}

.rules-list {
  margin: 0;
  padding-left: 20px;
  color: #666;
  line-height: 2;
}

.rules-list strong {
  color: #333;
}

.btn-primary {
  padding: 12px 24px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #059669;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #eee;
}

.btn-scan {
  padding: 12px 20px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-scan:hover:not(:disabled) {
  background: #2563eb;
}

.btn-scan:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.scanner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.scanner-modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.scanner-header h3 {
  margin: 0;
  color: #1a1a2e;
}

.scanner-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0 4px;
  line-height: 1;
}

.scanner-close:hover {
  color: #333;
}

.scanner-view {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.scanner-tip {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin: 12px 0 0;
}
</style>
