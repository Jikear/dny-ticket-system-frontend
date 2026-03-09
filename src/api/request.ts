import axios from 'axios'
import { showError } from '@/utils/toast'

const service = axios.create({
  baseURL: 'http://117.136.8.97:8080', // 后端地址，按需修改
  timeout: 10000
})

// 请求拦截器：自动附加 Token
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理后端 ApiResponse
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 后端约定：code === 0 为成功
    if (res.code !== 0) {
      showError(res.message || '请求失败')
      return Promise.reject(res)
    }
    return res
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络错误'
    showError(message)
    return Promise.reject(error)
  }
)

export default service