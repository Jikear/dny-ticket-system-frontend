import request from './request'
import type { TicketType, TimeSlot, CreateTicketTypeRequest, CreateTimeSlotRequest } from '@/types'

// Public APIs
export function getTicketTypes() {
  return request.get<any, { code: number; message: string; data: TicketType[] }>('/api/tickets/types')
}

export function getTicketTypeById(id: number) {
  return request.get<any, { code: number; message: string; data: TicketType }>(`/api/tickets/types/${id}`)
}

export function getTimeSlots() {
  return request.get<any, { code: number; message: string; data: TimeSlot[] }>('/api/tickets/slots')
}

// Admin APIs - Ticket Types
export function getAdminTicketTypes() {
  return request.get<any, { code: number; message: string; data: TicketType[] }>('/api/admin/tickets/types')
}

export function createTicketType(data: CreateTicketTypeRequest) {
  return request.post<any, { code: number; message: string; data: TicketType }>('/api/admin/tickets/types', data)
}

export function updateTicketType(id: number, data: CreateTicketTypeRequest) {
  return request.put<any, { code: number; message: string; data: TicketType }>(`/api/admin/tickets/types/${id}`, data)
}

export function deleteTicketType(id: number) {
  return request.delete<any, { code: number; message: string; data: null }>(`/api/admin/tickets/types/${id}`)
}

// Admin APIs - Time Slots
export function getAdminTimeSlots() {
  return request.get<any, { code: number; message: string; data: TimeSlot[] }>('/api/admin/tickets/slots')
}

export function createTimeSlot(data: CreateTimeSlotRequest) {
  return request.post<any, { code: number; message: string; data: TimeSlot }>('/api/admin/tickets/slots', data)
}

export function updateTimeSlot(id: number, data: CreateTimeSlotRequest) {
  return request.put<any, { code: number; message: string; data: TimeSlot }>(`/api/admin/tickets/slots/${id}`, data)
}

export function deleteTimeSlot(id: number) {
  return request.delete<any, { code: number; message: string; data: null }>(`/api/admin/tickets/slots/${id}`)
}
