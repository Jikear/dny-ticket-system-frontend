import request from './request'
import type { Announcement, CreateAnnouncementRequest, PagedResponse } from '@/types'

// Public APIs
export function getAnnouncements() {
  return request.get<any, { code: number; message: string; data: Announcement[] }>('/api/announcements')
}

export function getAnnouncementById(id: number) {
  return request.get<any, { code: number; message: string; data: Announcement }>(`/api/announcements/${id}`)
}

// Admin APIs
export function getAdminAnnouncements(page = 0, size = 10) {
  return request.get<any, { code: number; message: string; data: PagedResponse<Announcement> }>(
    '/api/admin/announcements',
    { params: { page, size } }
  )
}

export function getAdminAnnouncementById(id: number) {
  return request.get<any, { code: number; message: string; data: Announcement }>(`/api/admin/announcements/${id}`)
}

export function createAnnouncement(data: CreateAnnouncementRequest) {
  return request.post<any, { code: number; message: string; data: Announcement }>('/api/admin/announcements', data)
}

export function updateAnnouncement(id: number, data: CreateAnnouncementRequest) {
  return request.put<any, { code: number; message: string; data: Announcement }>(`/api/admin/announcements/${id}`, data)
}

export function deleteAnnouncement(id: number) {
  return request.delete<any, { code: number; message: string; data: null }>(`/api/admin/announcements/${id}`)
}
