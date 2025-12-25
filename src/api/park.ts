import request from './request'
import type { ParkInfo, Activity, CreateActivityRequest } from '@/types'

// Public APIs
export function getParkInfo() {
  return request.get<any, { code: number; message: string; data: ParkInfo }>('/api/park/info')
}

export function getActivities() {
  return request.get<any, { code: number; message: string; data: Activity[] }>('/api/park/activities')
}

export function getCurrentActivities() {
  return request.get<any, { code: number; message: string; data: Activity[] }>('/api/park/activities/current')
}

export function getActivityById(id: number) {
  return request.get<any, { code: number; message: string; data: Activity }>(`/api/park/activities/${id}`)
}

// Admin APIs
export function getAdminParkInfo() {
  return request.get<any, { code: number; message: string; data: ParkInfo }>('/api/admin/park/info')
}

export function updateParkInfo(data: Partial<ParkInfo>) {
  return request.put<any, { code: number; message: string; data: ParkInfo }>('/api/admin/park/info', data)
}

export function getAdminActivities() {
  return request.get<any, { code: number; message: string; data: Activity[] }>('/api/admin/park/activities')
}

export function createActivity(data: CreateActivityRequest) {
  return request.post<any, { code: number; message: string; data: Activity }>('/api/admin/park/activities', data)
}

export function updateActivity(id: number, data: CreateActivityRequest) {
  return request.put<any, { code: number; message: string; data: Activity }>(`/api/admin/park/activities/${id}`, data)
}

export function deleteActivity(id: number) {
  return request.delete<any, { code: number; message: string; data: null }>(`/api/admin/park/activities/${id}`)
}
