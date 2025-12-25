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
