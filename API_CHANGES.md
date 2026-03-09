# 前端接口文档（后端实现参考）

> 本文档由前端自动整理，列出所有前端调用的 HTTP 接口及数据结构，供后端开发人员对照实现。
> 标注 **🆕 新增** 的接口为本次迭代新增，需后端配合实现。

---

## 统一约定

### 基础地址

```
http://117.136.8.97:8080   （开发环境，可按需修改）
```

### 认证方式

所有需要登录的接口，请求头必须携带：

```
Authorization: Bearer <JWT Token>
```

Token 由登录接口返回，前端自动附加。

### 统一响应格式

所有接口均使用统一的 JSON 包装结构：

```json
{
  "code": 0,          // 0 = 成功，其他值 = 失败
  "message": "ok",   // 成功或失败的描述信息
  "data": { ... }    // 实际业务数据（失败时可为 null）
}
```

### 分页响应格式

涉及分页的接口，`data` 字段为：

```json
{
  "content": [],          // 当前页数据数组
  "totalElements": 100,   // 总记录数
  "totalPages": 10,       // 总页数
  "number": 0,            // 当前页码（0-based）
  "size": 10              // 每页大小
}
```

---

## 一、认证模块 `/api/auth`

### 1.1 登录

```
POST /api/auth/login
```

**请求体（JSON）：**

```json
{
  "username": "string",
  "password": "string"
}
```

**响应 `data`：**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "role": "ADMIN"
}
```

---

### 1.2 注册

```
POST /api/auth/register
```

**请求体（JSON）：**

```json
{
  "username": "string",
  "password": "string",
  "nickname": "string",   // 可选
  "phone": "string",      // 可选
  "email": "string"       // 可选
}
```

**响应 `data`：** `null` 或注册成功的用户对象

---

## 二、用户模块 `/api/user`

### 2.1 获取当前用户信息

```
GET /api/user/profile
```

**响应 `data`：** [User 对象](#user-对象)

---

### 2.2 更新用户信息

```
PUT /api/user/profile
```

**请求体（JSON）：**

```json
{
  "nickname": "string",   // 可选
  "realName": "string",   // 可选
  "idCard": "string",     // 可选
  "phone": "string",      // 可选
  "email": "string",      // 可选
  "region": "string"      // 可选
}
```

**响应 `data`：** [User 对象](#user-对象)

---

### 2.3 修改密码

```
PUT /api/user/password
```

**请求体（JSON）：**

```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**响应 `data`：** `null`

---

## 三、公告模块 `/api/announcements`

### 3.1 获取公告列表（公开）

```
GET /api/announcements
```

**响应 `data`：** [Announcement 对象](#announcement-对象)[]

---

### 3.2 获取公告详情（公开）

```
GET /api/announcements/{id}
```

**响应 `data`：** [Announcement 对象](#announcement-对象)

---

## 四、门票模块 `/api/tickets`

### 4.1 获取票种列表（公开）

```
GET /api/tickets/types
```

**响应 `data`：** [TicketType 对象](#tickettype-对象)[]

---

### 4.2 获取单个票种（公开）

```
GET /api/tickets/types/{id}
```

**响应 `data`：** [TicketType 对象](#tickettype-对象)

---

### 4.3 获取时间段列表（公开）

```
GET /api/tickets/slots
```

**响应 `data`：** [TimeSlot 对象](#timeslot-对象)[]

---

## 五、订单模块 `/api/orders`

### 5.1 创建订单（用户）

```
POST /api/orders
```

**请求体（JSON）：**

```json
{
  "ticketTypeId": 1,
  "timeSlotId": 2,
  "visitDate": "2026-03-15",
  "quantity": 2,
  "contactName": "张三",    // 可选
  "contactPhone": "138...", // 可选
  "contactIdCard": "..."    // 可选
}
```

**响应 `data`：** [Order 对象](#order-对象)

---

### 5.2 获取我的订单列表（用户）

```
GET /api/orders?page=0&size=10
```

**Query 参数：**

| 参数   | 类型    | 默认值 | 说明        |
|--------|---------|--------|-------------|
| `page` | integer | `0`    | 页码（0起） |
| `size` | integer | `10`   | 每页大小    |

**响应 `data`：** 分页 [Order 对象](#order-对象)

---

### 5.3 获取订单详情（用户）

```
GET /api/orders/{id}
```

**响应 `data`：** [Order 对象](#order-对象)

---

### 5.4 取消订单（用户）

```
PUT /api/orders/{id}/cancel?reason=xxx
```

**Query 参数：**

| 参数     | 类型   | 必填 | 说明     |
|----------|--------|------|----------|
| `reason` | string | 否   | 取消原因 |

**响应 `data`：** [Order 对象](#order-对象)

---

### 5.5 按订单号查询（用户）

```
GET /api/orders/query?orderNo=xxx
```

**响应 `data`：** [Order 对象](#order-对象)

---

## 六、公园模块 `/api/park`

### 6.1 获取公园信息（公开）

```
GET /api/park/info
```

**响应 `data`：** [ParkInfo 对象](#parkinfo-对象)

---

### 6.2 获取所有活动（公开）

```
GET /api/park/activities
```

**响应 `data`：** [Activity 对象](#activity-对象)[]

---

### 6.3 获取当前进行中的活动（公开）

```
GET /api/park/activities/current
```

**响应 `data`：** [Activity 对象](#activity-对象)[]

---

### 6.4 获取单个活动（公开）

```
GET /api/park/activities/{id}
```

**响应 `data`：** [Activity 对象](#activity-对象)

---

## 七、文件上传 `/api/upload`

### 7.1 上传图片

```
POST /api/upload/image
Content-Type: multipart/form-data
```

**表单字段：**

| 字段   | 类型 | 说明                        |
|--------|------|-----------------------------|
| `file` | File | 图片文件（jpg/png/gif，≤10MB） |

**响应 `data`：**

```json
{
  "url": "http://..."
}
```

---

## 八、管理员 - 用户管理 `/api/admin/users`

> 所有管理员接口均需 `ADMIN` 或 `STAFF` 角色。

### 8.1 获取用户列表

```
GET /api/admin/users?page=0&size=10
```

**响应 `data`：** 分页 [User 对象](#user-对象)

---

### 8.2 获取单个用户

```
GET /api/admin/users/{id}
```

**响应 `data`：** [User 对象](#user-对象)

---

### 8.3 切换用户状态（启用/禁用）

```
PUT /api/admin/users/{id}/toggle-status
```

**响应 `data`：** [User 对象](#user-对象)

---

### 8.4 创建员工账号

```
POST /api/admin/users/staff?username=xxx&password=xxx&nickname=xxx&role=STAFF
```

**Query 参数：**

| 参数       | 类型   | 必填 | 说明            |
|------------|--------|------|-----------------|
| `username` | string | 是   | 用户名          |
| `password` | string | 是   | 密码            |
| `nickname` | string | 否   | 昵称            |
| `role`     | string | 否   | 角色，默认STAFF |

**响应 `data`：** [User 对象](#user-对象)

---

## 九、管理员 - 统计模块 `/api/admin/stats`

### 9.1 获取概览统计数据

```
GET /api/admin/stats
```

**响应 `data`：**

```json
{
  "todayOrders": 42,
  "todayIncome": 8400.00,
  "monthIncome": 128000.00,
  "totalUsers": 3200,
  "ticketTypeStats": [
    { "name": "成人票", "value": 150 },
    { "name": "儿童票", "value": 80 }
  ],
  "regionStats": [
    { "name": "北京", "value": 200 },
    { "name": "上海", "value": 120 }
  ]
}
```

---

### 9.2 🆕 新增 - 获取趋势统计数据

```
GET /api/admin/stats/trend?period=week
```

**Query 参数：**

| 参数     | 类型   | 必填 | 可选值            | 说明                       |
|----------|--------|------|-------------------|----------------------------|
| `period` | string | 是   | `week` \| `month` | `week`=最近7天，`month`=最近30天 |

**响应 `data`：**

```json
{
  "orders": [
    { "date": "2026-02-24", "value": 12 },
    { "date": "2026-02-25", "value": 18 },
    { "date": "2026-02-26", "value": 15 },
    { "date": "2026-02-27", "value": 22 },
    { "date": "2026-02-28", "value": 30 },
    { "date": "2026-03-01", "value": 27 },
    { "date": "2026-03-02", "value": 35 }
  ],
  "income": [
    { "date": "2026-02-24", "value": 2400.00 },
    { "date": "2026-02-25", "value": 3600.00 }
  ],
  "users": [
    { "date": "2026-02-24", "value": 5 },
    { "date": "2026-02-25", "value": 8 }
  ],
  "entries": [
    { "date": "2026-02-24", "value": 40 },
    { "date": "2026-02-25", "value": 65 }
  ]
}
```

**字段说明：**

| 字段      | 类型                  | 说明                                              |
|-----------|-----------------------|---------------------------------------------------|
| `orders`  | TrendDataPoint[]      | 每日新增订单数                                    |
| `income`  | TrendDataPoint[]      | 每日收入（元）                                    |
| `users`   | TrendDataPoint[]      | 每日新增注册用户数                                |
| `entries` | TrendDataPoint[]      | 每日实际入园人数（状态为 ENTERED 的订单 quantity 之和） |

**TrendDataPoint 结构：**

| 字段    | 类型   | 说明                      |
|---------|--------|---------------------------|
| `date`  | string | 日期，格式 `YYYY-MM-DD`   |
| `value` | number | 当天的数值                |

> **注意：**
> - 返回的数据点数量：`week` 返回最近 7 天（包含今天），`month` 返回最近 30 天（包含今天）
> - 即使当天无数据，也应返回该日期的记录（`value` 为 `0`），保证前端折线图横轴连续
> - 日期按升序排列（最早的日期在前）

---

### 9.3 获取客流预警

```
GET /api/admin/stats/flow-warning
```

**响应 `data`：**

```json
{
  "date": "2026-03-02",
  "count": 350,
  "warning": true,
  "level": "HIGH",
  "message": "今日预约人数已超过最大承载量的 90%"
}
```

| 字段      | 类型    | 说明                                   |
|-----------|---------|----------------------------------------|
| `date`    | string  | 日期 `YYYY-MM-DD`                      |
| `count`   | integer | 今日预约人数                           |
| `warning` | boolean | 是否触发预警                           |
| `level`   | string  | 预警级别：`LOW` \| `MEDIUM` \| `HIGH`  |
| `message` | string  | 预警描述文字                           |

---

## 十、管理员 - 订单管理 `/api/admin/orders`

### 10.1 获取所有订单

```
GET /api/admin/orders?page=0&size=10
```

**响应 `data`：** 分页 [Order 对象](#order-对象)

---

### 10.2 获取单个订单

```
GET /api/admin/orders/{id}
```

**响应 `data`：** [Order 对象](#order-对象)

---

### 10.3 更新订单状态

```
PUT /api/admin/orders/{id}/status?status=ENTERED
```

**Query 参数：**

| 参数     | 类型   | 说明                                               |
|----------|--------|----------------------------------------------------|
| `status` | string | 订单状态：`PENDING` \| `ENTERED` \| `EXPIRED` \| `CANCELLED` \| `REFUNDED` |

**响应 `data`：** [Order 对象](#order-对象)

---

### 10.4 退款

```
PUT /api/admin/orders/{id}/refund?reason=xxx
```

**响应 `data`：** [Order 对象](#order-对象)

---

### 10.5 按用户信息搜索订单

```
GET /api/admin/orders/search?username=xxx&phone=xxx&realName=xxx&page=0&size=10
```

**Query 参数（均可选）：**

| 参数       | 类型    | 说明              |
|------------|---------|-------------------|
| `username` | string  | 用户名（模糊匹配） |
| `phone`    | string  | 手机号            |
| `realName` | string  | 真实姓名          |
| `page`     | integer | 页码（默认 0）    |
| `size`     | integer | 每页大小（默认 10）|

**响应 `data`：** 分页 [Order 对象](#order-对象)

---

## 十一、管理员 - 公告管理 `/api/admin/announcements`

### 11.1 获取公告列表

```
GET /api/admin/announcements?page=0&size=10
```

**响应 `data`：** 分页 [Announcement 对象](#announcement-对象)

---

### 11.2 获取单个公告

```
GET /api/admin/announcements/{id}
```

**响应 `data`：** [Announcement 对象](#announcement-对象)

---

### 11.3 创建公告

```
POST /api/admin/announcements
```

**请求体（JSON）：**

```json
{
  "title": "string",
  "content": "string",    // 可选
  "type": "NOTICE",       // 可选：NOTICE | WARNING | CLOSURE
  "pinned": 0,            // 可选：0=不置顶，1=置顶
  "status": 1             // 可选：0=草稿，1=已发布
}
```

**响应 `data`：** [Announcement 对象](#announcement-对象)

---

### 11.4 更新公告

```
PUT /api/admin/announcements/{id}
```

**请求体：** 同创建公告

**响应 `data`：** [Announcement 对象](#announcement-对象)

---

### 11.5 删除公告

```
DELETE /api/admin/announcements/{id}
```

**响应 `data`：** `null`

---

## 十二、管理员 - 门票管理 `/api/admin/tickets`

### 12.1 获取票种列表

```
GET /api/admin/tickets/types
```

**响应 `data`：** [TicketType 对象](#tickettype-对象)[]

---

### 12.2 创建票种

```
POST /api/admin/tickets/types
```

**请求体（JSON）：**

```json
{
  "name": "成人票",
  "description": "string",  // 可选
  "price": 120.00,
  "dailyQuota": 500,
  "status": 1               // 可选：0=下架，1=上架
}
```

**响应 `data`：** [TicketType 对象](#tickettype-对象)

---

### 12.3 更新票种

```
PUT /api/admin/tickets/types/{id}
```

**请求体：** 同创建票种

**响应 `data`：** [TicketType 对象](#tickettype-对象)

---

### 12.4 删除票种

```
DELETE /api/admin/tickets/types/{id}
```

**响应 `data`：** `null`

---

### 12.5 获取时间段列表

```
GET /api/admin/tickets/slots
```

**响应 `data`：** [TimeSlot 对象](#timeslot-对象)[]

---

### 12.6 创建时间段

```
POST /api/admin/tickets/slots
```

**请求体（JSON）：**

```json
{
  "name": "上午场",
  "startTime": "09:00",
  "endTime": "12:00",
  "quota": 200,
  "status": 1   // 可选
}
```

**响应 `data`：** [TimeSlot 对象](#timeslot-对象)

---

### 12.7 更新时间段

```
PUT /api/admin/tickets/slots/{id}
```

**请求体：** 同创建时间段

**响应 `data`：** [TimeSlot 对象](#timeslot-对象)

---

### 12.8 删除时间段

```
DELETE /api/admin/tickets/slots/{id}
```

**响应 `data`：** `null`

---

## 十三、管理员 - 公园管理 `/api/admin/park`

### 13.1 获取公园信息

```
GET /api/admin/park/info
```

**响应 `data`：** [ParkInfo 对象](#parkinfo-对象)

---

### 13.2 更新公园信息

```
PUT /api/admin/park/info
```

**请求体（JSON，字段均可选）：**

```json
{
  "name": "string",
  "logoUrl": "string",
  "description": "string",
  "openingHours": "09:00-18:00",
  "contactPhone": "string",
  "address": "string",
  "notice": "string"
}
```

**响应 `data`：** [ParkInfo 对象](#parkinfo-对象)

---

### 13.3 获取活动列表

```
GET /api/admin/park/activities
```

**响应 `data`：** [Activity 对象](#activity-对象)[]

---

### 13.4 创建活动

```
POST /api/admin/park/activities
```

**请求体（JSON）：**

```json
{
  "name": "string",
  "description": "string",       // 可选
  "imageUrl": "string",          // 可选
  "location": "string",          // 可选
  "startDate": "2026-03-01",     // 可选，格式 YYYY-MM-DD
  "endDate": "2026-03-31",       // 可选
  "dailyStartTime": "10:00",     // 可选，格式 HH:mm
  "dailyEndTime": "16:00",       // 可选
  "status": 1                    // 可选：0=下线，1=上线
}
```

**响应 `data`：** [Activity 对象](#activity-对象)

---

### 13.5 更新活动

```
PUT /api/admin/park/activities/{id}
```

**请求体：** 同创建活动

**响应 `data`：** [Activity 对象](#activity-对象)

---

### 13.6 删除活动

```
DELETE /api/admin/park/activities/{id}
```

**响应 `data`：** `null`

---

## 十四、管理员 - 系统日志 `/api/admin/system`

### 14.1 获取操作日志

```
GET /api/admin/system/logs?page=0&size=20&username=xxx
```

**Query 参数：**

| 参数       | 类型    | 必填 | 说明                |
|------------|---------|------|---------------------|
| `page`     | integer | 否   | 页码（默认 0）      |
| `size`     | integer | 否   | 每页大小（默认 20） |
| `username` | string  | 否   | 按用户名筛选        |

**响应 `data`：** 分页 [OperationLog 对象](#operationlog-对象)

---

## 数据结构定义

### User 对象

```json
{
  "id": 1,
  "username": "zhangsan",
  "nickname": "张三",
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "realName": "张三",
  "idCard": "110101199001011234",
  "region": "北京",
  "role": "USER",
  "status": 1,
  "createTime": "2026-01-01T00:00:00",
  "updateTime": "2026-01-01T00:00:00"
}
```

| 字段         | 类型    | 说明                             |
|--------------|---------|----------------------------------|
| `role`       | string  | `USER` \| `STAFF` \| `ADMIN`     |
| `status`     | integer | `1`=启用，`0`=禁用               |

---

### Order 对象

```json
{
  "id": 1,
  "orderNo": "ORD20260302001",
  "userId": 10,
  "ticketTypeId": 1,
  "ticketTypeName": "成人票",
  "timeSlotId": 2,
  "timeSlotName": "上午场",
  "visitDate": "2026-03-15",
  "quantity": 2,
  "unitPrice": 120.00,
  "totalAmount": 240.00,
  "status": "PENDING",
  "statusName": "待入园",
  "qrCode": "...",
  "contactName": "张三",
  "contactPhone": "13800138000",
  "contactIdCard": "...",
  "cancelReason": null,
  "refundReason": null,
  "createTime": "2026-03-02T10:00:00",
  "updateTime": "2026-03-02T10:00:00"
}
```

| 字段       | 类型   | 说明                                                              |
|------------|--------|-------------------------------------------------------------------|
| `status`   | string | `PENDING`=待入园 \| `ENTERED`=已入园 \| `EXPIRED`=已过期 \| `CANCELLED`=已取消 \| `REFUNDED`=已退款 |

---

### TicketType 对象

```json
{
  "id": 1,
  "name": "成人票",
  "description": "适用于18-60岁成人",
  "price": 120.00,
  "dailyQuota": 500,
  "status": 1,
  "createTime": "2026-01-01T00:00:00",
  "updateTime": "2026-01-01T00:00:00"
}
```

---

### TimeSlot 对象

```json
{
  "id": 1,
  "name": "上午场",
  "startTime": "09:00",
  "endTime": "12:00",
  "quota": 200,
  "status": 1,
  "createTime": "2026-01-01T00:00:00",
  "updateTime": "2026-01-01T00:00:00"
}
```

---

### ParkInfo 对象

```json
{
  "id": 1,
  "name": "大自然公园",
  "logoUrl": "http://.../logo.png",
  "description": "公园简介",
  "openingHours": "09:00-18:00",
  "contactPhone": "010-12345678",
  "address": "北京市朝阳区...",
  "notice": "节假日可能调整开放时间",
  "createTime": "2026-01-01T00:00:00",
  "updateTime": "2026-01-01T00:00:00"
}
```

---

### Activity 对象

```json
{
  "id": 1,
  "name": "春季赏花节",
  "description": "活动描述",
  "imageUrl": "http://.../img.png",
  "location": "园区东区",
  "startDate": "2026-03-01",
  "endDate": "2026-03-31",
  "dailyStartTime": "10:00",
  "dailyEndTime": "16:00",
  "status": 1,
  "createTime": "2026-01-01T00:00:00",
  "updateTime": "2026-01-01T00:00:00"
}
```

---

### Announcement 对象

```json
{
  "id": 1,
  "title": "公告标题",
  "content": "公告内容",
  "type": "NOTICE",
  "pinned": 0,
  "status": 1,
  "publisherId": 1,
  "publishTime": "2026-03-02T09:00:00",
  "createTime": "2026-03-02T09:00:00",
  "updateTime": "2026-03-02T09:00:00"
}
```

| 字段     | 类型   | 说明                                      |
|----------|--------|-------------------------------------------|
| `type`   | string | `NOTICE`=通知 \| `WARNING`=警告 \| `CLOSURE`=闭园 |
| `pinned` | integer | `1`=置顶，`0`=不置顶                    |
| `status` | integer | `1`=已发布，`0`=草稿                    |

---

### OperationLog 对象

```json
{
  "id": 1,
  "userId": 1,
  "username": "admin",
  "operationType": "UPDATE",
  "description": "更新公园信息",
  "requestPath": "/api/admin/park/info",
  "requestMethod": "PUT",
  "requestParams": "{}",
  "ipAddress": "192.168.1.1",
  "operationTime": "2026-03-02T10:30:00"
}
```

---

## 变更记录

| 版本 | 日期       | 变更内容                                                |
|------|------------|---------------------------------------------------------|
| v1.1 | 2026-03-02 | 🆕 新增 `GET /api/admin/stats/trend` 趋势统计接口         |
| v1.0 | —          | 初始版本，包含认证、用户、门票、订单、公园、公告等模块   |
