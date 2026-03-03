import request from './request'
import type { Order, CreateOrderRequest, PagedResponse } from '@/types'

// User APIs
export function createOrder(data: CreateOrderRequest) {
  return request.post<any, { code: number; message: string; data: Order }>('/api/orders', data)
}

export function getMyOrders(page = 0, size = 10) {
  return request.get<any, { code: number; message: string; data: PagedResponse<Order> }>(
    '/api/orders',
    { params: { page, size } }
  )
}

export function getOrderById(id: number) {
  return request.get<any, { code: number; message: string; data: Order }>(`/api/orders/${id}`)
}

export function cancelOrder(id: number, reason?: string) {
  const params = reason ? { reason } : {}
  return request.put<any, { code: number; message: string; data: Order }>(
    `/api/orders/${id}/cancel`,
    null,
    { params }
  )
}

export function getOrderQrCode(id: number) {
  return request.get<any, { code: number; message: string; data: { qrCodeBase64: string } }>(
    `/api/orders/${id}/qrcode`
  )
}

export function getOrderByOrderNo(orderNo: string) {
  return request.get<any, { code: number; message: string; data: Order }>(
    '/api/orders/query',
    { params: { orderNo } }
  )
}

// Admin APIs
export function getAdminOrders(page = 0, size = 10) {
  return request.get<any, { code: number; message: string; data: PagedResponse<Order> }>(
    '/api/admin/orders',
    { params: { page, size } }
  )
}

export function getAdminOrderById(id: number) {
  return request.get<any, { code: number; message: string; data: Order }>(`/api/admin/orders/${id}`)
}

export function updateOrderStatus(id: number, status: string) {
  return request.put<any, { code: number; message: string; data: Order }>(
    `/api/admin/orders/${id}/status`,
    null,
    { params: { status } }
  )
}

export function refundOrder(id: number, reason?: string) {
  const params = reason ? { reason } : {}
  return request.put<any, { code: number; message: string; data: Order }>(
    `/api/admin/orders/${id}/refund`,
    null,
    { params }
  )
}

export interface SearchOrdersByUserParams {
  username?: string
  phone?: string
  realName?: string
  page?: number
  size?: number
}

export function searchOrdersByUserInfo(params: SearchOrdersByUserParams) {
  const queryParams: Record<string, string | number> = {}
  if (params.username) queryParams.username = params.username
  if (params.phone) queryParams.phone = params.phone
  if (params.realName) queryParams.realName = params.realName
  queryParams.page = params.page ?? 0
  queryParams.size = params.size ?? 10

  return request.get<any, { code: number; message: string; data: PagedResponse<Order> }>(
    '/api/admin/orders/search',
    { params: queryParams }
  )
}
