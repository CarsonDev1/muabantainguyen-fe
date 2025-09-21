# Admin Features Documentation

## Tổng quan

Hệ thống admin đã được mở rộng với đầy đủ các chức năng quản lý, bao gồm:

## Các chức năng Admin mới

### 1. Quản lý Admin Users (`/admin/admins`)

-   **Tạo admin mới**: Thêm tài khoản admin với vai trò cụ thể
-   **Cập nhật vai trò**: Thay đổi vai trò của admin
-   **Xem danh sách**: Hiển thị tất cả admin với thông tin chi tiết
-   **Phân quyền**: Hiển thị danh sách quyền hạn của từng admin

### 2. Vai trò & Quyền hạn (`/admin/roles`)

-   **Xem vai trò**: Danh sách tất cả vai trò trong hệ thống
-   **Xem quyền hạn**: Danh sách quyền hạn được nhóm theo module
-   **Chi tiết quyền**: Hiển thị quyền hạn chi tiết theo từng vai trò

### 3. Quản lý FAQ (`/admin/faqs`)

-   **CRUD FAQ**: Tạo, đọc, cập nhật, xóa FAQ
-   **Trạng thái**: Bật/tắt hiển thị công khai
-   **Quản lý nội dung**: Câu hỏi và câu trả lời chi tiết

### 4. Quản lý Thông báo (`/admin/announcements`)

-   **CRUD Thông báo**: Tạo, đọc, cập nhật, xóa thông báo
-   **Trạng thái**: Bật/tắt hiển thị công khai
-   **Nội dung**: Tiêu đề và nội dung thông báo

### 5. Cài đặt Website (`/admin/settings`)

-   **Cài đặt công khai**: Thông tin hiển thị cho người dùng
-   **Cài đặt riêng tư**: Cấu hình hệ thống nội bộ
-   **Phân loại**: Nhóm cài đặt theo chức năng (branding, contact, security, etc.)

### 6. Quản lý Đơn hàng (`/admin/orders`)

-   **Danh sách đơn hàng**: Xem tất cả đơn hàng với bộ lọc
-   **Tìm kiếm**: Theo mã đơn hàng, tên khách hàng
-   **Lọc theo trạng thái**: Pending, Paid, Completed, Cancelled, Refunded
-   **Chi tiết đơn hàng**: Thông tin khách hàng, sản phẩm, thanh toán

### 7. Quản lý Khuyến mãi (`/admin/promotions`)

-   **CRUD Khuyến mãi**: Tạo, đọc, cập nhật, xóa khuyến mãi
-   **Loại khuyến mãi**: Phần trăm hoặc số tiền cố định
-   **Điều kiện**: Đơn hàng tối thiểu, giảm tối đa
-   **Thời gian**: Ngày bắt đầu và kết thúc
-   **Giới hạn sử dụng**: Số lần sử dụng tối đa

## Services mới

### Admin Service (`/services/admin-service.ts`)

```typescript
- getAdmins(): Lấy danh sách admin
- createAdmin(data): Tạo admin mới
- updateAdminRole(adminId, roleId): Cập nhật vai trò admin
- getRoles(): Lấy danh sách vai trò
- getPermissions(): Lấy danh sách quyền hạn
```

### FAQ Service (`/services/faq-service.ts`)

```typescript
- getAdminFAQs(): Lấy FAQ cho admin
- createFAQ(data): Tạo FAQ mới
- updateFAQ(id, data): Cập nhật FAQ
- deleteFAQ(id): Xóa FAQ
- getPublicFAQs(): Lấy FAQ công khai
```

### Announcement Service (`/services/announcement-service.ts`)

```typescript
- getAdminAnnouncements(): Lấy thông báo cho admin
- createAnnouncement(data): Tạo thông báo mới
- updateAnnouncement(id, data): Cập nhật thông báo
- deleteAnnouncement(id): Xóa thông báo
- getPublicAnnouncements(): Lấy thông báo công khai
```

### Settings Service (`/services/settings-service.ts`)

```typescript
- getAdminSettings(): Lấy cài đặt cho admin
- updateAdminSettings(settings): Cập nhật cài đặt
- getPublicSettings(): Lấy cài đặt công khai
- getResourceSettings(): Lấy cài đặt từ resource endpoint
```

### Promotion Service (`/services/promotion-service.ts`)

```typescript
- getAdminPromotions(): Lấy khuyến mãi cho admin
- createPromotion(data): Tạo khuyến mãi mới
- updatePromotion(id, data): Cập nhật khuyến mãi
- deletePromotion(id): Xóa khuyến mãi
- getActivePromotions(): Lấy khuyến mãi đang hoạt động
- validatePromotion(code, amount): Xác thực khuyến mãi
```

## UI Components mới

### Switch Component (`/components/ui/switch.tsx`)

-   Component toggle switch cho cài đặt boolean
-   Sử dụng Radix UI Switch

### Tabs Component (`/components/ui/tabs.tsx`)

-   Component tabs để phân chia nội dung
-   Sử dụng Radix UI Tabs

### Accordion Component (`/components/ui/accordion.tsx`)

-   Component accordion để hiển thị nội dung có thể thu gọn
-   Sử dụng Radix UI Accordion

## Cài đặt Dependencies

Các dependencies mới đã được thêm vào `package.json`:

```json
{
	"@radix-ui/react-accordion": "^1.2.1",
	"@radix-ui/react-switch": "^1.1.1",
	"@radix-ui/react-tabs": "^1.1.1",
	"vaul": "^1.1.1"
}
```

Chạy lệnh để cài đặt:

```bash
npm install
```

## Cấu trúc Sidebar

Sidebar đã được cập nhật với các menu mới:

```typescript
const items = [
	{ title: 'Trang chủ', url: '/admin', icon: Home },
	{ title: 'Danh mục', url: '/admin/categories', icon: Inbox },
	{ title: 'Người dùng', url: '/admin/users', icon: Users },
	{ title: 'Quản trị viên', url: '/admin/admins', icon: Shield },
	{ title: 'Vai trò & Quyền', url: '/admin/roles', icon: Settings },
	{ title: 'Voucher', url: '/admin/vouchers', icon: Tag },
	{ title: 'Đơn hàng', url: '/admin/orders', icon: Calendar },
	{ title: 'Sản phẩm', url: '/admin/products', icon: Search },
	{ title: 'Khuyến mãi', url: '/admin/promotions', icon: Percent },
	{ title: 'Ví', url: '/admin/wallet', icon: Wallet },
	{ title: 'FAQ', url: '/admin/faqs', icon: HelpCircle },
	{ title: 'Thông báo', url: '/admin/announcements', icon: Bell },
	{ title: 'Cài đặt', url: '/admin/settings', icon: Settings },
];
```

## Dashboard Admin

Trang dashboard chính đã được cải thiện với:

-   **Thống kê tổng quan**: Số lượng người dùng, đơn hàng, sản phẩm, voucher
-   **Thao tác nhanh**: Truy cập nhanh đến các chức năng quan trọng
-   **Trạng thái hệ thống**: Hiển thị trạng thái hoạt động của hệ thống
-   **Menu chính**: Danh sách các chức năng chính

## Lưu ý

1. **API Integration**: Tất cả các service đã được tạo và sẵn sàng tích hợp với backend API
2. **Error Handling**: Tất cả các trang đều có xử lý lỗi và thông báo toast
3. **Loading States**: Hiển thị trạng thái loading khi tải dữ liệu
4. **Form Validation**: Các form đều có validation cơ bản
5. **Responsive Design**: Tất cả các trang đều responsive trên mobile và desktop

## Kết luận

Hệ thống admin đã được hoàn thiện với đầy đủ các chức năng quản lý cần thiết. Tất cả các trang đều có giao diện đẹp, dễ sử dụng và tích hợp tốt với backend API.
