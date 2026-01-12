// API Response wrapper
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// Paginated response
export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// User types
export interface User {
  id: number
  username: string
  nickname: string | null
  phone: string | null
  email: string | null
  realName: string | null
  idCard: string | null
  region: string | null
  role: 'USER' | 'STAFF' | 'ADMIN'
  status: number
  createTime: string
  updateTime: string
}

export interface UpdateProfileRequest {
  nickname?: string
  realName?: string
  idCard?: string
  phone?: string
  email?: string
  region?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

// Park types
export interface ParkInfo {
  id: number
  name: string
  logoUrl: string | null
  description: string | null
  openingHours: string
  contactPhone: string
  address: string | null
  notice: string | null
  createTime: string
  updateTime: string
}

export interface Activity {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  location: string | null
  startDate: string | null
  endDate: string | null
  dailyStartTime: string | null
  dailyEndTime: string | null
  status: number
  createTime: string
  updateTime: string
}

export interface CreateActivityRequest {
  name: string
  description?: string
  imageUrl?: string
  location?: string
  startDate?: string
  endDate?: string
  dailyStartTime?: string
  dailyEndTime?: string
  status?: number
}

// Ticket types
export interface TicketType {
  id: number
  name: string
  description: string | null
  price: number
  dailyQuota: number
  status: number
  createTime: string
  updateTime: string
}

export interface CreateTicketTypeRequest {
  name: string
  description?: string
  price: number
  dailyQuota: number
  status?: number
}

export interface TimeSlot {
  id: number
  name: string
  startTime: string
  endTime: string
  quota: number
  status: number
  createTime: string
  updateTime: string
}

export interface CreateTimeSlotRequest {
  name: string
  startTime: string
  endTime: string
  quota: number
  status?: number
}

// Order types
export type OrderStatus = 'PENDING' | 'ENTERED' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED'

export interface Order {
  id: number
  orderNo: string
  userId: number
  ticketTypeId: number
  ticketTypeName: string
  timeSlotId: number
  timeSlotName: string
  visitDate: string
  quantity: number
  unitPrice: number
  totalAmount: number
  status: OrderStatus
  statusName: string
  qrCode: string
  contactName: string | null
  contactPhone: string | null
  contactIdCard: string | null
  cancelReason: string | null
  refundReason: string | null
  createTime: string
  updateTime: string
}

export interface CreateOrderRequest {
  ticketTypeId: number
  timeSlotId: number
  visitDate: string
  quantity: number
  contactName?: string
  contactPhone?: string
  contactIdCard?: string
}

// Announcement types
export type AnnouncementType = 'NOTICE' | 'WARNING' | 'CLOSURE'

export interface Announcement {
  id: number
  title: string
  content: string | null
  type: AnnouncementType
  pinned: number
  status: number
  publisherId: number
  publishTime: string | null
  createTime: string
  updateTime: string
}

export interface CreateAnnouncementRequest {
  title: string
  content?: string
  type?: AnnouncementType
  pinned?: number
  status?: number
}

// Statistics types
export interface StatItem {
  name: string
  value: number
}

export interface Statistics {
  todayOrders: number
  todayIncome: number
  monthIncome: number
  totalUsers: number
  ticketTypeStats: StatItem[]
  regionStats: StatItem[]
}

export interface FlowWarning {
  date: string
  count: number
  warning: boolean
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  message: string
}

// Operation log types
export interface OperationLog {
  id: number
  userId: number
  username: string
  operationType: string
  description: string
  requestPath: string
  requestMethod: string
  requestParams: string
  ipAddress: string
  operationTime: string
}

// Upload types
export interface UploadResponse {
  url: string
}
