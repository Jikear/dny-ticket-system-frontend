import request from './request'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  nickname?: string
  phone?: string
  email?: string
}

export interface LoginResponse {
  token: string
  username: string
  role: string
}

export function loginApi(data: LoginRequest) {
  // 修改处：使用 <any, T> 形式。
  // 第一个参数 any 是 AxiosResponse 的 data 类型（此处忽略，因为我们覆盖了返回类型）。
  // 第二个参数是实际 Promise resolve 的类型，匹配拦截器返回的结构。
  return request.post<any, {
    code: number
    message: string
    data: LoginResponse
  }>('/api/auth/login', data)
}

export function registerApi(data: RegisterRequest) {
  return request.post('/api/auth/register', data)
}