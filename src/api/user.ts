import request from './request'
import type { User, UpdateProfileRequest, ChangePasswordRequest } from '@/types'

export function getUserProfile() {
  return request.get<any, { code: number; message: string; data: User }>('/api/user/profile')
}

export function updateUserProfile(data: UpdateProfileRequest) {
  return request.put<any, { code: number; message: string; data: User }>('/api/user/profile', data)
}

export function changePassword(data: ChangePasswordRequest) {
  return request.put<any, { code: number; message: string; data: null }>('/api/user/password', data)
}
