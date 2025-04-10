# 邦瓏建設網站開發文件

## 專案簡介

本專案是為邦瓏建設開發的官方網站，包含前台展示和後台管理系統。網站使用 Next.js 14 框架開發，部署在 Vercel 平台上，並使用 Vercel 提供的各種服務來管理資料庫和檔案儲存。本網站採用現代化的響應式設計，確保在各種設備上提供最佳的用戶體驗。

## 技術架構

### 前端技術
- **框架**：Next.js 14 (App Router)
- **樣式**：Tailwind CSS
- **狀態管理**：React Hooks, SWR
- **表單處理**：React Hook Form, Zod
- **動畫效果**：Framer Motion

### 後端技術
- **API 路由**：Next.js API Routes
- **資料庫 ORM**：Prisma
- **資料庫**：Vercel Postgres (Neon)
- **身份驗證**：NextAuth.js
- **檔案儲存**：Vercel Blob Storage
- **部署與監控**：Vercel Analytics

## 專案結構

```
banglongconstruction/
├── node_modules/
├── prisma/
│   └── schema.prisma    # 資料庫模型定義
│── public/uploads/
│   ├── carousel/        # 輪播圖片
│   ├── projects/        # 建案項目圖片
│   │   ├── new/         # 新案鑑賞
│   │   ├── classic/     # 歷年經典
│   │   └── future/      # 未來計畫
│   ├── gallery/         # 其他圖庫圖片
│   └── documents/       # 文件相關圖片
├── scripts/
│   └── create-admin.js  # 建立管理員帳戶的腳本
├── src/
│   ├── app/
│   │   ├── (front)/     # 前台頁面
│   │   │   ├── page.tsx        # 首頁
│   │   │   ├── about/          # 關於邦隆
│   │   │   │   ├── 緣起邦瓏
│   │   │   │   ├── 企業精神
│   │   │   │   ├── 品牌願景
│   │   │   │   └── 相關企業
│   │   │   ├── arch/           # 城市美學
│   │   │   │   ├── 新案鑑賞
│   │   │   │   ├── 歷年經典
│   │   │   │   └── 未來計畫
│   │   │   ├── device/         # 知識中心
│   │   │   │   └── 維護保養
│   │   │   ├── service/        # 尊榮售服
│   │   │   │   ├── 交屋手冊
│   │   │   │   └── 售服流程
│   │   │   └── contact/        # 聯絡我們
│   │   │
│   │   ├── admin/      # 後台管理頁面
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── carousel/
│   │   │   ├── projects/
│   │   │   ├── documents/
│   │   │   └── contacts/
│   │   │
│   │   ├── api/        # API 路由
│   │   │   ├── auth/
│   │   │   ├── carousel/
│   │   │   ├── projects/
│   │   │   ├── documents/
│   │   │   └── contacts/
│   │
│   ├── components/     # 共用元件
│   │   ├── ui/         # 基礎UI元件
│   │   ├── admin/      # 後台專用元件
│   │   └── front/      # 前台專用元件
│   │
│   ├── lib/            # 工具函數與共用庫
│   │   ├── db.ts       # 資料庫連接
│   │   ├── auth.ts     # 認證相關
│   │   └── utils.ts    # 輔助函數
│   │
│   ├── styles/         # 樣式檔案
│   │
│   └── types/          # TypeScript 型別定義
│
├── .env                # 環境變數 (用於 Prisma)
├── .env.local          # 本地環境變數 (不進入版本控制)
├── package.json
└── ... 其他設定檔
```

## 資料庫模型

我們使用 Prisma 來管理資料庫模型。以下是主要的資料表結構：

### User 表 (管理員帳戶)
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      String   @default("admin")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Carousel 表 (首頁輪播圖)
```prisma
model Carousel {
  id         String   @id @default(cuid())
  title      String?
  imageUrl   String
  linkUrl    String?
  order      Int
  isActive   Boolean  @default(true)
  textPosition String   @default("center") // 文字位置: topLeft, topCenter, topRight, centerLeft, center, centerRight, bottomLeft, bottomCenter, bottomRight
  textDirection String  @default("horizontal") // 文字方向: horizontal, vertical
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Project 表 (建案項目)
```prisma
model Project {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  category    String   // 新案鑑賞、歷年經典、未來計畫
  imageUrl    String
  details     Json?    // 可儲存複雜的項目資訊
  order       Int
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Document 表 (交屋手冊等文件)
```prisma
model Document {
  id          String   @id @default(cuid())
  title       String
  description String?
  fileUrl     String
  fileType    String   // pdf, docx 等
  category    String   // 交屋手冊、售服流程等
  order       Int
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ContactSubmission 表 (聯絡表單提交記錄)
```prisma
model ContactSubmission {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  message   String   @db.Text
  status    String   @default("new") // new, processing, completed
  reply     String?  @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 已完成的設定

1. **專案初始化**
   - 使用 `create-next-app` 建立 Next.js 專案
   - 設定 TypeScript, ESLint, Tailwind CSS
   - 建立基本的目錄結構

2. **資料庫連接**
   - 設定 Prisma 與 Vercel Postgres (Neon) 的連接
   - 定義資料庫模型
   - 生成 Prisma Client

3. **管理員帳戶**
   - 建立腳本用於創建初始管理員帳戶
   - 成功創建了第一個管理員帳戶

## 套件安裝

已安裝以下套件：

```bash
# 資料庫和身份驗證相關
npm install @vercel/postgres @prisma/client next-auth bcrypt

# 檔案上傳和儲存
npm install @vercel/blob

# UI 組件和表單處理
npm install react-hook-form zod @hookform/resolvers
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge

# 資料獲取和狀態管理
npm install swr axios

# 日期處理
npm install date-fns

# 動畫和互動效果
npm install framer-motion

# 圖片優化和處理
npm install sharp

# 開發工具
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

## 環境變數設定

專案使用了以下環境變數：

- `POSTGRES_PRISMA_URL`: Postgres 連接字串 (供 Prisma 使用)
- `POSTGRES_URL_NON_POOLING`: 非連接池的 Postgres 連接字串
- `NEXTAUTH_SECRET`: NextAuth.js 加密密鑰
- `NEXTAUTH_URL`: NextAuth.js 使用的 URL，開發環境為 http://localhost:3000
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob Storage 的讀寫權限令牌

這些變數已經設定在 `.env` 和 `.env.local` 文件中。開發人員應確保這些環境變數在本地開發環境中正確配置。

## 開發進度

### 已完成功能

1. **身份驗證系統**
   - ✅ NextAuth.js 的配置與整合
   - ✅ 管理員登入頁面與身份驗證中間件
   - ✅ 基於角色的訪問控制

2. **輪播圖管理**
   - ✅ 輪播圖 CRUD API 開發完成
   - ✅ 後台輪播圖管理界面
   - ✅ 圖片上傳與管理功能
   - ✅ 輪播圖順序調整功能

3. **前台頁面**
   - ✅ 首頁與輪播圖顯示
   - ✅ 導航與頁腳組件
   - ✅ 關於邦隆各子頁面
   - ✅ 城市美學頁面結構
   - ✅ 知識中心頁面結構
   - ✅ 尊榮售服頁面結構
   - ✅ 聯絡表單頁面

4. **聯絡表單功能**
   - ✅ 前台聯絡表單提交
   - ✅ 後台聯絡表單管理與回覆功能

### 進行中功能

1. **建案項目管理**
   - 🔄 建案項目上傳與管理頁面
   - 🔄 建案項目前台展示

2. **文件管理**
   - 🔄 交屋手冊與文件上傳功能
   - 🔄 文件分類與管理功能

### 待開發功能

1. **其他管理功能**
   - 📝 內容管理系統優化
   - 📝 多媒體資源管理
   - 📝 用戶權限細分

2. **前台功能強化**
   - 📝 建案項目詳情頁面
   - 📝 文件下載功能
   - 📝 圖片畫廊與燈箱效果

3. **效能與優化**
   - 📝 圖片優化與壓縮
   - 📝 頁面加載性能優化
   - 📝 SEO 優化

4. **測試與部署**
   - 📝 單元測試與集成測試
   - 📝 跨瀏覽器兼容性測試
   - 📝 設置 CI/CD 流程

## 部署資訊

- **部署平台**: Vercel
- **專案名稱**: banglongconstruction
- **專案連結**: https://www.banglong.tw
- **測試環境**: https://banglongconstruction-staging.vercel.app

## 管理員帳戶

已創建的管理員帳戶信息：
- **電子郵件**: hanfourhuang@gmail.com
- **密碼**: BAng1ong@2025

## 前端路由

### 前台路由
- `/`: 首頁
- `/about`: 關於邦隆
- `/arch`: 城市美學
- `/device`: 知識中心
- `/service`: 尊榮售服
- `/contact`: 聯絡我們

### 後台路由
- `/admin/login`: 登入頁面
- `/admin/dashboard`: 後台首頁
- `/admin/carousel`: 輪播圖管理
- `/admin/projects`: 建案項目管理
- `/admin/documents`: 交屋手冊管理
- `/admin/contacts`: 聯絡表單管理

---

本文件將隨著專案開發進度不斷更新。