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
          <label>Logo</label>
          <div class="image-upload">
            <input
              type="file"
              ref="logoFileInput"
              accept="image/jpeg,image/png,image/gif"
              @change="handleLogoFileChange"
              style="display: none"
            />
            <div class="upload-preview" v-if="form.logoUrl">
              <img :src="form.logoUrl" alt="Logo预览" class="preview-image" />
            </div>
            <div class="upload-actions">
              <button type="button" @click="triggerLogoUpload" class="btn-upload" :disabled="uploading">
                {{ uploading ? '上传中...' : '上传图片' }}
              </button>
              <span class="upload-hint">支持 jpg/png/gif，最大10MB</span>
            </div>
            <input type="url" v-model="form.logoUrl" placeholder="或输入图片URL" class="url-input" />
          </div>
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
import { uploadImage } from '@/api/upload'

const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const success = ref('')
const error = ref('')
const logoFileInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  name: '',
  logoUrl: '',
  description: '',
  openingHours: '',
  contactPhone: '',
  address: '',
  notice: ''
})

const triggerLogoUpload = () => {
  logoFileInput.value?.click()
}

const handleLogoFileChange = async (event: Event) => {
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
    form.logoUrl = res.data.url
  } catch (e: any) {
    error.value = e?.message || '上传失败'
  } finally {
    uploading.value = false
    // Reset file input
    if (target) target.value = ''
  }
}

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

.success-msg {
  color: #4caf50;
  margin-top: 16px;
}

.error-msg {
  color: #e74c3c;
  margin-top: 16px;
}
</style>
