import request from './request'
import type { User, PagedResponse, Statistics, FlowWarning, OperationLog } from '@/types'

// User Management
export function getAdminUsers(page = 0, size = 10) {
  return request.get<any, { code: number; message: string; data: PagedResponse<User> }>(
    '/api/admin/users',
    { params: { page, size } }
  )
}

export function getAdminUserById(id: number) {
  return request.get<any, { code: number; message: string; data: User }>(`/api/admin/users/${id}`)
}

export function toggleUserStatus(id: number) {
  return request.put<any, { code: number; message: string; data: User }>(`/api/admin/users/${id}/toggle-status`)
}

export interface CreateStaffRequest {
  username: string
  password: string
  nickname?: string
  role?: string
}

export function createStaffUser(data: CreateStaffRequest) {
  // Send as query params as per API spec (POST /api/admin/users/staff?username=...&password=...)
  // Note: The API spec requires query params, but ideally should use request body for security
  const params: Record<string, string> = { 
    username: data.username, 
    password: data.password 
  }
  if (data.nickname) params.nickname = data.nickname
  if (data.role) params.role = data.role
  return request.post<any, { code: number; message: string; data: User }>(
    '/api/admin/users/staff',
    null,
    { params }
  )
}

// Statistics
export function getStatistics() {
  return request.get<any, { code: number; message: string; data: Statistics }>('/api/admin/stats')
}

export function getFlowWarning() {
  return request.get<any, { code: number; message: string; data: FlowWarning }>('/api/admin/stats/flow-warning')
}

// System Logs
export function getOperationLogs(page = 0, size = 20, username?: string) {
  const params: Record<string, any> = { page, size }
  if (username) params.username = username
  return request.get<any, { code: number; message: string; data: PagedResponse<OperationLog> }>(
    '/api/admin/system/logs',
    { params }
  )
}
