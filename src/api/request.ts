import axios from 'axios'

const service = axios.create({
  baseURL: 'http://localhost:8080', // 后端地址，按需修改
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
      // 可在这里弹出错误消息
      console.error(res.message || '请求失败')
      return Promise.reject(res)
    }
    return res
  },
  (error) => {
    console.error('网络错误', error)
    return Promise.reject(error)
  }
)

export default service