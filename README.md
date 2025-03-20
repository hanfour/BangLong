# 邦瓏建設官方網站

本專案是邦瓏建設的官方網站，包含前台展示和後台管理系統，使用 Next.js 14 開發，部署在 Vercel 平台上。

## 專案特點

- 使用 Next.js 14 App Router 架構
- Tailwind CSS 響應式設計
- Prisma ORM 與 PostgreSQL 數據庫整合
- NextAuth.js 身份驗證系統
- 完整的後台管理功能

## 安裝與運行

### 安裝依賴

```bash
npm install
```

### 環境變數設定

在項目根目錄創建 `.env.local` 文件，並配置以下變數：

```
POSTGRES_PRISMA_URL=your_postgres_connection_string
POSTGRES_URL_NON_POOLING=your_non_pooling_postgres_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 資料庫初始化

```bash
npx prisma migrate dev
```

### 建立管理員帳戶

```bash
node scripts/create-admin.js
```

### 運行開發伺服器

```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000) 查看網站。

## 專案結構

- `/src/app/(front)` - 前台頁面
- `/src/app/admin` - 後台管理頁面
- `/src/app/api` - API 路由
- `/src/components` - 可重用元件
- `/prisma` - 資料庫模型定義

## 部署

本項目配置為自動部署到 Vercel。每次提交到主分支後，將自動觸發部署流程。

## 更多資訊

詳細的開發文檔請參閱 [development-doc.md](./development-doc.md)。