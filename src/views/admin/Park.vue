<template>
  <div class="admin-page">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="park-form">
      <form @submit.prevent="handleSubmit">
        <div class="form-field">
          <label>园区名称</label>
          <input type="text" v-model="form.name" />
        </div>

        <div class="form-field">
          <label>Logo URL</label>
          <input type="url" v-model="form.logoUrl" placeholder="https://" />
        </div>

        <div class="form-field">
          <label>园区描述</label>
          <textarea v-model="form.description" rows="4"></textarea>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>开放时间</label>
            <input type="text" v-model="form.openingHours" placeholder="09:00-18:00" />
          </div>
          <div class="form-field">
            <label>联系电话</label>
            <input type="tel" v-model="form.contactPhone" />
          </div>
        </div>

        <div class="form-field">
          <label>园区地址</label>
          <input type="text" v-model="form.address" />
        </div>

        <div class="form-field">
          <label>游客须知</label>
          <textarea v-model="form.notice" rows="6"></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="saving" class="btn-primary">
            {{ saving ? '保存中...' : '保存修改' }}
          </button>
        </div>

        <p v-if="success" class="success-msg">{{ success }}</p>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getAdminParkInfo, updateParkInfo } from '@/api/park'

const loading = ref(true)
const saving = ref(false)
const success = ref('')
const error = ref('')

const form = reactive({
  name: '',
  logoUrl: '',
  description: '',
  openingHours: '',
  contactPhone: '',
  address: '',
  notice: ''
})

const loadParkInfo = async () => {
  try {
    const res = await getAdminParkInfo()
    const data = res.data
    form.name = data.name || ''
    form.logoUrl = data.logoUrl || ''
    form.description = data.description || ''
    form.openingHours = data.openingHours || ''
    form.contactPhone = data.contactPhone || ''
    form.address = data.address || ''
    form.notice = data.notice || ''
  } catch (e) {
    console.error('Failed to load park info:', e)
    error.value = '加载园区信息失败'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  success.value = ''
  error.value = ''
  saving.value = true

  try {
    await updateParkInfo({
      name: form.name,
      logoUrl: form.logoUrl || undefined,
      description: form.description || undefined,
      openingHours: form.openingHours,
      contactPhone: form.contactPhone,
      address: form.address || undefined,
      notice: form.notice || undefined
    })
    success.value = '保存成功'
  } catch (e: any) {
    error.value = e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadParkInfo()
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

.park-form {
  max-width: 800px;
}

.form-field {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-field label {
  display: block;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-field input,
.form-field textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-field textarea {
  resize: vertical;
}

.form-actions {
  margin-top: 32px;
}

.btn-primary {
  padding: 12px 32px;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.success-msg {
  color: #4caf50;
  margin-top: 16px;
}

.error-msg {
  color: #e74c3c;
  margin-top: 16px;
}
</style>
