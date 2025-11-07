# 交屋手冊密碼保護與文件管理系統 - Design Document

## Overview

本設計採用 **數據結構優先** 的方法,遵循 "Good programmers worry about data structures and their relationships" 原則。

### 核心設計哲學

1. **清晰的職責分離**: `Handbook` 管理手冊元資訊,`HandbookFile` 管理文件實體
2. **零破壞性**: 完全不修改現有 `Document` 模型,新增獨立的 `Handbook` 系統
3. **消除特殊情況**: 透過正確的數據結構設計,避免複雜的條件判斷
4. **向後相容**: 刪除專案時手冊資料保留,保護客戶權益

### 技術棧

- **前端**: Next.js 14 (App Router), React 18, TypeScript
- **後端**: Next.js API Routes, NextAuth.js
- **資料庫**: PostgreSQL + Prisma ORM
- **檔案儲存**: 現有雲端儲存方案 (透過 `/api/upload` endpoint)
- **密碼加密**: bcrypt (已有依賴)
- **Session 管理**: sessionStorage (前端)

## Architecture

### 系統架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                         前台 (Front)                          │
│  ┌────────────────────┐      ┌──────────────────────────┐   │
│  │ /service/handbook  │      │ /service/handbook/[id]   │   │
│  │  - 歡迎文字        │ ───► │  - 封面圖                │   │
│  │  - 手冊列表        │      │  - 密碼驗證              │   │
│  │  (網格佈局)        │      │  - 文件列表 & 下載       │   │
│  └────────────────────┘      └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ GET  /api/handbooks              - 獲取手冊列表      │   │
│  │ GET  /api/handbooks/[id]         - 獲取單一手冊      │   │
│  │ POST /api/handbooks/[id]/verify  - 密碼驗證          │   │
│  │ GET  /api/handbooks/[id]/files   - 獲取文件列表      │   │
│  │ POST /api/handbooks/[id]/files/[fileId]/download     │   │
│  │                                  - 記錄下載次數       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ 後台 Admin APIs                                       │   │
│  │ GET    /api/handbooks/admin      - 獲取全部手冊      │   │
│  │ POST   /api/handbooks/admin      - 新增手冊          │   │
│  │ PUT    /api/handbooks/admin/[id] - 更新手冊          │   │
│  │ DELETE /api/handbooks/admin/[id] - 刪除手冊          │   │
│  │ POST   /api/handbooks/admin/[id]/files - 上傳文件    │   │
│  │ PUT    /api/handbooks/admin/[id]/files/[fileId]      │   │
│  │ DELETE /api/handbooks/admin/[id]/files/[fileId]      │   │
│  │ POST   /api/handbooks/admin/reorder - 重排序手冊     │   │
│  │ POST   /api/handbooks/admin/[id]/files/reorder       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                       │
│  ┌────────────┐   1:N   ┌──────────────┐   1:N  ┌─────────┐│
│  │  Project   │────────►│   Handbook   │───────►│Handbook ││
│  │            │         │              │        │  File   ││
│  └────────────┘         │ - projectId? │        └─────────┘│
│                         │ - password   │                    │
│                         │   (bcrypt)   │                    │
│                         └──────────────┘                    │
│  onDelete: SetNull      onDelete: Cascade                   │
└─────────────────────────────────────────────────────────────┘
```

### 後台架構

```
┌─────────────────────────────────────────────────────────────┐
│                    後台管理介面 (Admin)                       │
│                                                              │
│  /admin/handbooks                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 手冊列表                                              │   │
│  │ ┌──────────┬──────────┬──────────┬─────────┐         │   │
│  │ │ 專案篩選 │ 搜尋     │ 新增手冊 │ 排序    │         │   │
│  │ └──────────┴──────────┴──────────┴─────────┘         │   │
│  │                                                        │   │
│  │ [封面] 手冊A | 專案X | **** | 5個文件 | 啟用 | [編輯]  │   │
│  │ [封面] 手冊B | 專案Y | **** | 3個文件 | 停用 | [編輯]  │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  /admin/handbooks/new  或  /admin/handbooks/[id]/edit       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 手冊表單                                              │   │
│  │  - 所屬專案: [下拉選單] (可為空)                      │   │
│  │  - 手冊標題: [輸入框]                                 │   │
│  │  - 封面圖片: [上傳]                                   │   │
│  │  - 密碼: [輸入框] (6-8位)                             │   │
│  │  - 描述: [文字框]                                     │   │
│  │  - 排序: [數字]                                       │   │
│  │  - 啟用: [開關]                                       │   │
│  │                                           [儲存並管理文件]│   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  /admin/handbooks/[id]/files                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 文件管理                                              │   │
│  │ [上傳新文件] (PDF/DOC/PPT)                            │   │
│  │                                                        │   │
│  │ [圖標] 交屋說明.pdf | 1.2MB | 下載23次 | [編輯][刪除] │   │
│  │ [圖標] 設備手冊.doc | 850KB | 下載12次 | [編輯][刪除] │   │
│  │                                          [可拖曳排序]   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### Prisma Schema 定義

```prisma
// 交屋手冊主表
model Handbook {
  id            String         @id @default(cuid())
  title         String         // 手冊標題
  coverImageUrl String         // 封面圖片 URL
  password      String         // bcrypt 加密的密碼
  description   String?        // 手冊描述
  order         Int            // 排序順序
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // 關聯
  projectId     String?        // 可為空,允許獨立手冊
  project       Project?       @relation(fields: [projectId], references: [id], onDelete: SetNull)
  files         HandbookFile[] // 一對多關聯到文件

  @@index([projectId])
  @@index([order])
  @@index([isActive])
}

// 交屋手冊文件表
model HandbookFile {
  id            String   @id @default(cuid())
  title         String   // 文件顯示名稱
  fileUrl       String   // 文件 URL
  fileType      String   // 文件類型 (pdf, doc, docx, ppt, pptx)
  fileSize      Int?     // 文件大小 (bytes)
  order         Int      // 排序順序
  downloadCount Int      @default(0) // 下載次數
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 關聯
  handbookId    String
  handbook      Handbook @relation(fields: [handbookId], references: [id], onDelete: Cascade)

  @@index([handbookId])
  @@index([order])
}

// 更新 Project 模型 (新增關聯)
model Project {
  // ... 現有欄位 ...
  handbooks     Handbook[] // 新增:一對多關聯到手冊
}
```

### TypeScript 型別定義

```typescript
// src/types/handbook.ts

export interface Handbook {
  id: string;
  title: string;
  coverImageUrl: string;
  password: string; // 僅後端使用,前端不應接收
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  project?: {
    id: string;
    title: string;
  };
  files?: HandbookFile[];
  _count?: {
    files: number;
  };
}

export interface HandbookFile {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  order: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  handbookId: string;
}

// 前台 API 回應 (不含密碼)
export interface HandbookPublic {
  id: string;
  title: string;
  coverImageUrl: string;
  description?: string;
  order: number;
  projectId?: string;
  project?: {
    id: string;
    title: string;
  };
}

// 密碼驗證請求
export interface HandbookVerifyRequest {
  password: string;
}

// 密碼驗證回應
export interface HandbookVerifyResponse {
  success: boolean;
  message?: string;
}

// 文件列表回應 (需密碼驗證後才能取得)
export interface HandbookFilesResponse {
  files: HandbookFile[];
}
```

### 資料庫遷移策略

```bash
# 步驟 1: 更新 schema.prisma
# 步驟 2: 建立遷移
npx prisma migrate dev --name add_handbook_models

# 步驟 3: 生成 Prisma Client
npx prisma generate
```

**遷移注意事項**:
- 新增的模型不會影響現有資料
- `Project.handbooks` 關聯是可選的,不會破壞現有專案
- 遷移完成後現有功能應零影響

## Components and Interfaces

### 前台組件

#### 1. `/src/app/(front)/service/handbook/page.tsx`

**手冊列表頁** - 重構現有頁面

```typescript
'use client';

interface HandbookListPageProps {}

export default function HandbookListPage() {
  // State
  const [handbooks, setHandbooks] = useState<HandbookPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 獲取手冊列表
  useEffect(() => {
    fetchHandbooks();
  }, []);

  const fetchHandbooks = async () => {
    try {
      const response = await fetch('/api/handbooks');
      const data = await response.json();
      setHandbooks(data.handbooks);
    } catch (err) {
      setError('無法載入交屋手冊');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* 歡迎文字區塊 */}
      <WelcomeMessage />

      {/* 手冊網格列表 */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {handbooks.map((handbook) => (
          <HandbookCard
            key={handbook.id}
            handbook={handbook}
            onClick={() => router.push(`/service/handbook/${handbook.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
```

**子組件**:

- `<WelcomeMessage />` - 固定文字區塊
- `<HandbookCard />` - 手冊卡片 (封面 + 標題)

#### 2. `/src/app/(front)/service/handbook/[id]/page.tsx`

**手冊詳情頁** - 新增

```typescript
'use client';

interface HandbookDetailPageProps {
  params: { id: string };
}

export default function HandbookDetailPage({ params }: HandbookDetailPageProps) {
  // State
  const [handbook, setHandbook] = useState<HandbookPublic | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [files, setFiles] = useState<HandbookFile[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 檢查 sessionStorage 是否已驗證過
  useEffect(() => {
    const verified = sessionStorage.getItem(`handbook_${params.id}_verified`);
    if (verified === 'true') {
      setIsVerified(true);
      fetchFiles();
    }
  }, [params.id]);

  // 密碼驗證
  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/handbooks/${params.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        sessionStorage.setItem(`handbook_${params.id}_verified`, 'true');
        fetchFiles();
      } else {
        setError('密碼錯誤,請重新輸入');
      }
    } catch (err) {
      setError('驗證失敗,請稍後再試');
    }
  };

  // 獲取文件列表
  const fetchFiles = async () => {
    const response = await fetch(`/api/handbooks/${params.id}/files`);
    const data = await response.json();
    setFiles(data.files);
  };

  // 下載文件
  const handleDownload = async (fileId: string, fileUrl: string) => {
    // 記錄下載次數
    await fetch(`/api/handbooks/${params.id}/files/${fileId}/download`, {
      method: 'POST',
    });

    // 開啟下載
    window.open(fileUrl, '_blank');
  };

  return (
    <div>
      {/* 封面圖 */}
      <HandbookCover coverImageUrl={handbook?.coverImageUrl} />

      {!isVerified ? (
        /* 密碼輸入表單 */
        <PasswordForm
          onSubmit={handleVerify}
          password={password}
          setPassword={setPassword}
          error={error}
        />
      ) : (
        /* 文件列表 */
        <FileList
          files={files}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
```

**子組件**:

- `<HandbookCover />` - 封面圖展示
- `<PasswordForm />` - 密碼輸入表單
- `<FileList />` - 文件列表
- `<FileItem />` - 單一文件項目 (圖標 + 名稱 + 下載按鈕)

### 後台組件

#### 3. `/src/app/admin/handbooks/page.tsx`

**手冊列表頁** - 新增

```typescript
'use client';

export default function AdminHandbooksPage() {
  // State
  const [handbooks, setHandbooks] = useState<Handbook[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReordering, setIsReordering] = useState(false);

  // 獲取手冊列表
  const fetchHandbooks = async () => {
    const params = new URLSearchParams();
    if (selectedProject !== 'all') {
      params.append('projectId', selectedProject);
    }
    if (searchQuery) {
      params.append('search', searchQuery);
    }

    const response = await fetch(`/api/handbooks/admin?${params}`);
    const data = await response.json();
    setHandbooks(data.handbooks);
  };

  // 刪除手冊
  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此手冊嗎?此操作將同時刪除所有關聯文件。')) {
      return;
    }

    await fetch(`/api/handbooks/admin/${id}`, { method: 'DELETE' });
    fetchHandbooks();
  };

  // 重排序
  const handleReorder = async (newOrder: Handbook[]) => {
    await fetch('/api/handbooks/admin/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handbooks: newOrder.map((h, idx) => ({ id: h.id, order: idx }))
      }),
    });
  };

  return (
    <AdminLayout>
      {/* 篩選與搜尋 */}
      <div className="flex gap-4 mb-6">
        <ProjectFilter
          projects={projects}
          selected={selectedProject}
          onChange={setSelectedProject}
        />
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜尋手冊標題或專案名稱"
        />
        <Link href="/admin/handbooks/new">
          <Button>新增手冊</Button>
        </Link>
      </div>

      {/* 手冊列表 */}
      <HandbookTable
        handbooks={handbooks}
        isReordering={isReordering}
        onReorder={handleReorder}
        onDelete={handleDelete}
      />
    </AdminLayout>
  );
}
```

#### 4. `/src/app/admin/handbooks/[id]/edit/page.tsx`

**手冊編輯頁** - 新增

```typescript
'use client';

interface HandbookFormPageProps {
  params: { id?: string }; // 無 id 表示新增
}

export default function HandbookFormPage({ params }: HandbookFormPageProps) {
  const [formData, setFormData] = useState({
    title: '',
    projectId: null as string | null,
    coverImageUrl: '',
    password: '',
    description: '',
    order: 0,
    isActive: true,
  });
  const [projects, setProjects] = useState<Project[]>([]);

  // 載入現有資料 (編輯模式)
  useEffect(() => {
    if (params.id) {
      fetchHandbook(params.id);
    }
    fetchProjects();
  }, [params.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const url = params.id
      ? `/api/handbooks/admin/${params.id}`
      : '/api/handbooks/admin';

    const method = params.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    // 儲存後跳轉到文件管理頁面
    router.push(`/admin/handbooks/${data.handbook.id}/files`);
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit}>
        {/* 專案選擇 */}
        <ProjectSelect
          projects={projects}
          value={formData.projectId}
          onChange={(val) => setFormData({ ...formData, projectId: val })}
        />

        {/* 其他表單欄位 */}
        <Input label="手冊標題" required />
        <ImageUpload label="封面圖片" required />
        <Input label="密碼" type="password" required minLength={6} maxLength={8} />
        <Textarea label="描述" />
        <Input label="排序" type="number" />
        <Toggle label="啟用" />

        <Button type="submit">
          {params.id ? '更新手冊' : '建立手冊並管理文件'}
        </Button>
      </form>
    </AdminLayout>
  );
}
```

#### 5. `/src/app/admin/handbooks/[id]/files/page.tsx`

**文件管理頁** - 新增

```typescript
'use client';

interface HandbookFilesPageProps {
  params: { id: string };
}

export default function HandbookFilesPage({ params }: HandbookFilesPageProps) {
  const [files, setFiles] = useState<HandbookFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 上傳文件
  const handleUpload = async (file: File) => {
    setIsUploading(true);

    // 先上傳文件到儲存服務
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
    });
    const { url } = await uploadResponse.json();

    // 建立 HandbookFile 記錄
    await fetch(`/api/handbooks/admin/${params.id}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: file.name,
        fileUrl: url,
        fileType: file.name.split('.').pop(),
        fileSize: file.size,
        order: files.length,
      }),
    });

    fetchFiles();
    setIsUploading(false);
  };

  // 刪除文件
  const handleDelete = async (fileId: string) => {
    if (!confirm('確定要刪除此文件嗎?')) return;

    await fetch(`/api/handbooks/admin/${params.id}/files/${fileId}`, {
      method: 'DELETE',
    });

    fetchFiles();
  };

  return (
    <AdminLayout>
      <h1>文件管理</h1>

      {/* 上傳區域 */}
      <FileUploader
        onUpload={handleUpload}
        isUploading={isUploading}
        accept=".pdf,.doc,.docx,.ppt,.pptx"
      />

      {/* 文件列表 */}
      <FileTable
        files={files}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
    </AdminLayout>
  );
}
```

## API Routes 設計

### 前台 APIs

#### `GET /api/handbooks`

獲取啟用的手冊列表 (不含密碼)

**Response**:
```json
{
  "handbooks": [
    {
      "id": "clx123",
      "title": "邦瓏 A案交屋手冊",
      "coverImageUrl": "https://...",
      "description": "...",
      "order": 0,
      "projectId": "proj123",
      "project": {
        "id": "proj123",
        "title": "邦瓏 A案"
      }
    }
  ]
}
```

#### `GET /api/handbooks/[id]`

獲取單一手冊 (不含密碼)

#### `POST /api/handbooks/[id]/verify`

驗證密碼

**Request**:
```json
{ "password": "123456" }
```

**Response**:
```json
{ "success": true }
```

**實作重點**:
```typescript
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { password } = await request.json();

  const handbook = await prisma.handbook.findUnique({
    where: { id: params.id },
    select: { password: true }, // 只取密碼欄位
  });

  const isValid = await bcrypt.compare(password, handbook.password);

  return NextResponse.json({ success: isValid });
}
```

#### `GET /api/handbooks/[id]/files`

獲取手冊文件列表 (需密碼驗證通過,由前端 session 控制)

**Response**:
```json
{
  "files": [
    {
      "id": "file123",
      "title": "交屋說明.pdf",
      "fileUrl": "https://...",
      "fileType": "pdf",
      "fileSize": 1245678,
      "order": 0,
      "downloadCount": 23
    }
  ]
}
```

#### `POST /api/handbooks/[id]/files/[fileId]/download`

記錄下載次數

**實作**:
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  await prisma.handbookFile.update({
    where: { id: params.fileId },
    data: { downloadCount: { increment: 1 } },
  });

  return NextResponse.json({ success: true });
}
```

### 後台 APIs

#### `GET /api/handbooks/admin`

獲取全部手冊 (含密碼遮罩,含停用)

**Query Params**:
- `projectId` - 篩選特定專案
- `search` - 搜尋標題或專案名稱

**Response**: 包含 `_count.files` 統計文件數量

#### `POST /api/handbooks/admin`

新增手冊

**Request**:
```json
{
  "title": "邦瓏 A案交屋手冊",
  "projectId": "proj123", // 可為 null
  "coverImageUrl": "https://...",
  "password": "123456", // 明文,後端加密
  "description": "...",
  "order": 0,
  "isActive": true
}
```

**實作重點**:
```typescript
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  const data = await request.json();

  // 密碼加密
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const handbook = await prisma.handbook.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ handbook });
}
```

#### `PUT /api/handbooks/admin/[id]`

更新手冊

**注意**: 如果 `password` 欄位有值,需重新加密;如果為空,保留原密碼

#### `DELETE /api/handbooks/admin/[id]`

刪除手冊 (cascade 刪除所有 files)

#### `POST /api/handbooks/admin/reorder`

重排序手冊

**Request**:
```json
{
  "handbooks": [
    { "id": "clx123", "order": 0 },
    { "id": "clx456", "order": 1 }
  ]
}
```

#### `POST /api/handbooks/admin/[id]/files`

上傳新文件到手冊

#### `PUT /api/handbooks/admin/[id]/files/[fileId]`

更新文件資訊 (標題、排序)

#### `DELETE /api/handbooks/admin/[id]/files/[fileId]`

刪除文件

#### `POST /api/handbooks/admin/[id]/files/reorder`

重排序文件

## Error Handling

### 前台錯誤處理

1. **網路錯誤**: 顯示友善提示 "無法連接伺服器,請檢查網路連線"
2. **密碼錯誤**: 顯示 "密碼錯誤,請重新輸入",不限制錯誤次數
3. **找不到手冊**: 404 頁面或重定向到列表頁
4. **下載失敗**: Toast 提示 "下載失敗,請稍後再試"

### 後台錯誤處理

1. **未授權**: 重定向到登入頁 (`/admin/login`)
2. **表單驗證錯誤**: 紅色邊框標示錯誤欄位,顯示驗證訊息
3. **重複排序衝突**: 自動調整 order 值避免衝突
4. **檔案上傳失敗**: 顯示錯誤訊息,保留表單資料
5. **資料庫錯誤**: 捕獲 Prisma 錯誤,記錄 log,顯示通用錯誤訊息

### API 錯誤回應格式

```typescript
// 統一錯誤格式
interface ApiError {
  error: string;        // 錯誤訊息
  details?: string;     // 詳細錯誤 (開發環境)
  code?: string;        // 錯誤代碼
}

// 範例
return NextResponse.json(
  {
    error: '手冊不存在',
    code: 'HANDBOOK_NOT_FOUND'
  },
  { status: 404 }
);
```

## Testing Strategy

### 手動測試檢查清單

#### 前台測試

- [ ] 手冊列表正確顯示所有啟用手冊
- [ ] 點擊手冊可進入詳情頁
- [ ] 輸入錯誤密碼顯示錯誤提示
- [ ] 輸入正確密碼顯示文件列表
- [ ] 同一 session 已驗證手冊無需重複輸入密碼
- [ ] 點擊文件可成功下載
- [ ] 下載後次數正確增加
- [ ] 響應式佈局在手機/平板/桌面正常

#### 後台測試

- [ ] 手冊列表顯示所有手冊 (含停用)
- [ ] 專案篩選功能正常
- [ ] 搜尋功能可找到正確手冊
- [ ] 新增手冊表單驗證正確
- [ ] 上傳封面圖片成功
- [ ] 密碼加密儲存 (檢查資料庫)
- [ ] 更新手冊資訊成功
- [ ] 刪除手冊會二次確認
- [ ] 刪除手冊後文件也被刪除
- [ ] 拖曳排序功能正常
- [ ] 文件上傳支援 PDF/DOC/PPT 格式
- [ ] 文件列表顯示下載次數
- [ ] 刪除文件功能正常

### 資料一致性測試

- [ ] 刪除專案後,手冊 projectId 設為 null
- [ ] 刪除手冊後,關聯文件全部刪除
- [ ] 排序值沒有衝突
- [ ] 外鍵約束正常運作

### 安全性測試

- [ ] 前台 API 不會回傳密碼欄位
- [ ] 密碼以 bcrypt 雜湊儲存
- [ ] 未登入無法訪問後台 API
- [ ] 檔案上傳有類型和大小限制
- [ ] SQL Injection 防護 (Prisma 自動處理)
- [ ] XSS 防護 (React 自動 escape)

### 效能測試

- [ ] 手冊列表載入時間 < 2秒
- [ ] 密碼驗證響應 < 500ms
- [ ] 圖片使用 lazy loading
- [ ] 大檔案下載不阻塞 UI

## Implementation Phases

### Phase 1: 資料庫與 API (2-3 天)

1. 更新 Prisma Schema
2. 執行資料庫遷移
3. 建立所有 API routes
4. 測試 API endpoints

### Phase 2: 後台介面 (3-4 天)

1. 手冊列表頁
2. 手冊新增/編輯頁
3. 文件管理頁
4. 整合測試

### Phase 3: 前台介面 (2-3 天)

1. 重構手冊列表頁
2. 建立手冊詳情頁
3. 密碼驗證流程
4. 文件下載功能

### Phase 4: 測試與優化 (1-2 天)

1. 完整功能測試
2. 效能優化
3. Bug 修復
4. 使用者體驗優化

**總計: 8-12 天**
