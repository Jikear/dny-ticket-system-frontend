import request from './request'
import type { UploadResponse } from '@/types'

/**
 * Upload an image file
 * @param file The image file to upload (supports jpg/png/gif, max 10MB)
 * @returns The URL of the uploaded image
 */
export function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request.post<any, { code: number; message: string; data: UploadResponse }>(
    '/api/upload/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}
