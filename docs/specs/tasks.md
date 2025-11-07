# 交屋手冊密碼保護與文件管理系統 - Task List

## Phase 1: 資料庫與型別定義 (2-3 天)

- [x] **1. 更新 Prisma Schema**
    - [x] 1.1. 新增 Handbook 模型
        - *Goal*: 建立交屋手冊主表,包含所有必要欄位與索引
        - *Details*:
          - 在 `prisma/schema.prisma` 新增 `Handbook` 模型
          - 欄位: id, title, coverImageUrl, password, description, order, isActive, projectId, createdAt, updatedAt
          - 索引: projectId, order, isActive
          - 關聯: Project (1:N), HandbookFile (1:N)
        - *Requirements*: 數據模型需求

    - [x] 1.2. 新增 HandbookFile 模型
        - *Goal*: 建立手冊文件表,支援多文件上傳
        - *Details*:
          - 欄位: id, title, fileUrl, fileType, fileSize, order, downloadCount, handbookId, createdAt, updatedAt
          - 索引: handbookId, order
          - 關聯: Handbook (N:1, onDelete: Cascade)
        - *Requirements*: 數據模型需求

    - [x] 1.3. 更新 Project 模型
        - *Goal*: 新增 Project 與 Handbook 的關聯
        - *Details*:
          - 在 Project 模型新增 `handbooks Handbook[]` 欄位
          - 設定 onDelete: SetNull 保護客戶資料
        - *Requirements*: 數據模型需求

    - [x] 1.4. 執行資料庫遷移
        - *Goal*: 將 Schema 變更應用到資料庫
        - *Details*:
          - 執行 `npx prisma migrate dev --name add_handbook_models`
          - 執行 `npx prisma generate` 生成 Prisma Client
          - 驗證遷移成功,檢查資料庫表結構
        - *Requirements*: 資料庫遷移策略

- [x] **2. 建立 TypeScript 型別定義**
    - [x] 2.1. 建立 handbook.ts 型別檔案
        - *Goal*: 定義前後端共用的型別介面
        - *Details*:
          - 建立 `src/types/handbook.ts`
          - 定義介面: Handbook, HandbookFile, HandbookPublic, HandbookVerifyRequest, HandbookVerifyResponse, HandbookFilesResponse
          - 確保型別與 Prisma Schema 一致
        - *Requirements*: TypeScript 型別定義

    - [x] 2.2. 更新 global.d.ts (如需要)
        - *Goal*: 確保型別可全域使用
        - *Details*:
          - 如有需要,在 `src/types/global.d.ts` 匯出新型別
        - *Requirements*: TypeScript 型別定義

## Phase 2: 後端 API 開發 (3-4 天)

- [x] **3. 建立前台 API Routes**
    - [x] 3.1. GET /api/handbooks
        - *Goal*: 獲取所有啟用的手冊列表 (不含密碼)
        - *Details*:
          - 建立 `src/app/api/handbooks/route.ts`
          - 查詢條件: isActive = true
          - 排序: order ASC
          - Include: project (id, title)
          - 回應欄位排除 password
        - *Requirements*: 前台功能 - 手冊列表

    - [x] 3.2. GET /api/handbooks/[id]/route.ts
        - *Goal*: 獲取單一手冊資訊 (不含密碼)
        - *Details*:
          - 建立 `src/app/api/handbooks/[id]/route.ts`
          - 檢查手冊存在性,回傳 404 若不存在
          - 回應欄位排除 password
        - *Requirements*: 前台功能 - 手冊詳情頁

    - [x] 3.3. POST /api/handbooks/[id]/verify/route.ts
        - *Goal*: 驗證密碼
        - *Details*:
          - 建立 `src/app/api/handbooks/[id]/verify/route.ts`
          - 使用 bcrypt.compare() 驗證密碼
          - 回應: { success: boolean }
          - 錯誤處理: 手冊不存在、密碼格式錯誤
        - *Requirements*: 前台功能 - 密碼驗證

    - [x] 3.4. GET /api/handbooks/[id]/files/route.ts
        - *Goal*: 獲取手冊的文件列表
        - *Details*:
          - 建立 `src/app/api/handbooks/[id]/files/route.ts`
          - 查詢所有 handbookId 匹配的文件
          - 排序: order ASC
          - 包含下載次數
        - *Requirements*: 前台功能 - 文件列表

    - [x] 3.5. POST /api/handbooks/[id]/files/[fileId]/download/route.ts
        - *Goal*: 記錄文件下載次數
        - *Details*:
          - 建立 `src/app/api/handbooks/[id]/files/[fileId]/download/route.ts`
          - 使用 Prisma update 增加 downloadCount
          - `data: { downloadCount: { increment: 1 } }`
          - 回應: { success: true }
        - *Requirements*: 前台功能 - 下載追蹤

- [x] **4. 建立後台 Admin API Routes**
    - [x] 4.1. GET /api/handbooks/admin/route.ts
        - *Goal*: 獲取所有手冊 (含停用,含密碼遮罩)
        - *Details*:
          - 建立 `src/app/api/handbooks/admin/route.ts`
          - 支援 query params: projectId, search
          - Include: project, _count.files
          - 密碼欄位替換為 '****' 遮罩
          - 需 NextAuth 認證
        - *Requirements*: 後台功能 - 手冊列表

    - [x] 4.2. POST /api/handbooks/admin/route.ts
        - *Goal*: 新增手冊
        - *Details*:
          - 同檔案內實作 POST handler
          - 使用 bcrypt.hash() 加密密碼 (salt rounds: 10)
          - 驗證必填欄位: title, coverImageUrl, password
          - 驗證密碼長度: 6-8 位
          - 回應: 新建立的 handbook (含 id)
        - *Requirements*: 後台功能 - 新增手冊

    - [x] 4.3. PUT /api/handbooks/admin/[id]/route.ts
        - *Goal*: 更新手冊資訊
        - *Details*:
          - 建立 `src/app/api/handbooks/admin/[id]/route.ts` (PUT)
          - 如果 password 欄位有值,重新加密;若為空,保留原密碼
          - 允許更新: title, coverImageUrl, projectId, description, order, isActive
        - *Requirements*: 後台功能 - 編輯手冊

    - [x] 4.4. DELETE /api/handbooks/admin/[id]/route.ts
        - *Goal*: 刪除手冊 (cascade 刪除文件)
        - *Details*:
          - 同檔案內實作 DELETE handler
          - Prisma delete 會自動 cascade 刪除 HandbookFile
          - 回應: { success: true }
        - *Requirements*: 後台功能 - 刪除手冊

    - [x] 4.5. POST /api/handbooks/admin/reorder/route.ts
        - *Goal*: 批次更新手冊排序
        - *Details*:
          - 建立 `src/app/api/handbooks/admin/reorder/route.ts`
          - Request body: { handbooks: [{ id, order }] }
          - 使用 Promise.all() + Prisma update 批次更新
        - *Requirements*: 後台功能 - 拖曳排序

    - [x] 4.6. POST /api/handbooks/admin/[id]/files/route.ts
        - *Goal*: 上傳新文件到手冊
        - *Details*:
          - 建立 `src/app/api/handbooks/admin/[id]/files/route.ts`
          - 接收已上傳的文件 URL (由前端先呼叫 /api/upload)
          - 建立 HandbookFile 記錄
          - 欄位: title, fileUrl, fileType, fileSize, order
        - *Requirements*: 後台功能 - 文件管理

    - [x] 4.7. PUT /api/handbooks/admin/[id]/files/[fileId]/route.ts
        - *Goal*: 更新文件資訊
        - *Details*:
          - 建立 `src/app/api/handbooks/admin/[id]/files/[fileId]/route.ts` (PUT)
          - 允許更新: title, order
        - *Requirements*: 後台功能 - 編輯文件

    - [x] 4.8. DELETE /api/handbooks/admin/[id]/files/[fileId]/route.ts
        - *Goal*: 刪除文件
        - *Details*:
          - 同檔案內實作 DELETE handler
          - Prisma delete 刪除 HandbookFile 記錄
          - 可選: 同時刪除雲端儲存的文件
        - *Requirements*: 後台功能 - 刪除文件

    - [x] 4.9. POST /api/handbooks/admin/[id]/files/reorder/route.ts
        - *Goal*: 批次更新文件排序
        - *Details*:
          - 建立 `src/app/api/handbooks/admin/[id]/files/reorder/route.ts`
          - 類似手冊排序邏輯
        - *Requirements*: 後台功能 - 文件排序

- [ ] **5. API 測試**
    - [x] 5.1. 測試前台 API endpoints
        - *Goal*: 確保所有前台 API 正常運作
        - *Details*:
          - 使用 Postman 或 curl 測試
          - 測試正常流程、錯誤處理、邊界條件
          - 驗證密碼不會在回應中洩漏

    - [x] 5.2. 測試後台 API endpoints
        - *Goal*: 確保所有後台 API 正常運作
        - *Details*:
          - 測試 CRUD 操作
          - 測試排序功能
          - 測試檔案上傳與刪除
          - 驗證認證保護

## Phase 3: 後台介面開發 (3-4 天)

- [ ] **6. 建立後台手冊列表頁**
    - [x] 6.1. 建立 /admin/handbooks/page.tsx
        - *Goal*: 顯示所有手冊的管理介面
        - *Details*:
          - 建立 `src/app/admin/handbooks/page.tsx`
          - 實作專案篩選下拉選單
          - 實作搜尋功能 (標題或專案名稱)
          - 顯示手冊列表 (表格或卡片)
          - 每個手冊顯示: 封面縮圖、標題、所屬專案、密碼遮罩、文件數量、狀態、操作按鈕
        - *Requirements*: 後台功能 - 手冊列表

    - [x] 6.2. 實作拖曳排序功能
        - *Goal*: 允許管理員調整手冊順序
        - *Details*:
          - 使用 react-beautiful-dnd 或類似套件
          - 拖曳後呼叫 reorder API
          - 顯示排序模式切換按鈕
        - *Requirements*: 後台功能 - 排序

    - [x] 6.3. 實作刪除確認對話框
        - *Goal*: 防止誤刪手冊
        - *Details*:
          - 點擊刪除按鈕彈出確認對話框
          - 提示: "確定要刪除此手冊嗎?此操作將同時刪除所有關聯文件。"
          - 確認後呼叫 DELETE API
        - *Requirements*: 後台功能 - 刪除手冊

- [ ] **7. 建立後台手冊表單頁**
    - [x] 7.1. 建立 /admin/handbooks/new/page.tsx
        - *Goal*: 新增手冊表單
        - *Details*:
          - 建立 `src/app/admin/handbooks/new/page.tsx`
          - 表單欄位: 所屬專案 (下拉選單), 手冊標題, 封面圖片上傳, 密碼, 描述, 排序, 啟用開關
          - 專案下拉選單從 /api/projects/admin 載入
          - 允許留空 (獨立手冊)
        - *Requirements*: 後台功能 - 新增手冊

    - [x] 7.2. 建立 /admin/handbooks/[id]/edit/page.tsx
        - *Goal*: 編輯手冊表單
        - *Details*:
          - 建立 `src/app/admin/handbooks/[id]/edit/page.tsx`
          - 載入現有手冊資料填入表單
          - 密碼欄位預設為空,若使用者輸入新密碼則更新
          - 使用與新增頁面相同的表單組件
        - *Requirements*: 後台功能 - 編輯手冊

    - [x] 7.3. 實作封面圖片上傳
        - *Goal*: 上傳並預覽封面圖片
        - *Details*:
          - 呼叫 /api/upload 上傳圖片
          - 顯示上傳進度
          - 上傳成功後顯示預覽
          - 允許重新上傳
        - *Requirements*: 後台功能 - 封面上傳

    - [x] 7.4. 實作表單驗證
        - *Goal*: 確保資料正確性
        - *Details*:
          - 前端驗證: 必填欄位、密碼長度 (6-8位)
          - 顯示驗證錯誤訊息
          - 禁用提交按鈕直到表單有效
        - *Requirements*: 後台功能 - 表單驗證

- [x] **8. 建立後台文件管理頁**
    - [x] 8.1. 建立 /admin/handbooks/[id]/files/page.tsx
        - *Goal*: 管理手冊內的文件
        - *Details*:
          - 建立 `src/app/admin/handbooks/[id]/files/page.tsx`
          - 顯示麵包屑導航 (手冊列表 > 手冊詳情 > 文件管理)
          - 顯示當前手冊標題
        - *Requirements*: 後台功能 - 文件管理

    - [x] 8.2. 實作文件上傳功能
        - *Goal*: 上傳新文件到手冊
        - *Details*:
          - 檔案選擇器,限制類型: .pdf,.doc,.docx,.ppt,.pptx
          - 顯示檔案名稱、大小、類型
          - 先呼叫 /api/upload 上傳文件
          - 再呼叫 /api/handbooks/admin/[id]/files 建立記錄
          - 顯示上傳進度
        - *Requirements*: 後台功能 - 上傳文件

    - [x] 8.3. 實作文件列表
        - *Goal*: 顯示所有已上傳文件
        - *Details*:
          - 表格顯示: 文件圖標、名稱、類型、大小、下載次數、操作按鈕
          - 文件圖標根據類型顯示 (PDF/DOC/PPT)
          - 操作按鈕: 編輯、刪除
        - *Requirements*: 後台功能 - 文件列表

    - [x] 8.4. 實作文件編輯
        - *Goal*: 修改文件顯示名稱
        - *Details*:
          - 點擊編輯按鈕彈出對話框或內聯編輯
          - 允許修改文件名稱
          - 呼叫 PUT API 更新
        - *Requirements*: 後台功能 - 編輯文件

    - [x] 8.5. 實作文件刪除
        - *Goal*: 刪除不需要的文件
        - *Details*:
          - 點擊刪除按鈕彈出確認對話框
          - 確認後呼叫 DELETE API
          - 從列表中移除
        - *Requirements*: 後台功能 - 刪除文件

    - [x] 8.6. 實作文件拖曳排序
        - *Goal*: 調整文件顯示順序
        - *Details*:
          - 使用 react-beautiful-dnd
          - 拖曳後呼叫 reorder API
        - *Requirements*: 後台功能 - 文件排序

- [ ] **9. 後台介面優化與測試**
    - [x] 9.1. 響應式設計調整
        - *Goal*: 確保後台在不同裝置正常顯示
        - *Details*:
          - 測試手機、平板、桌面視圖
          - 調整表格在小螢幕的顯示方式

    - [x] 9.2. 載入與錯誤狀態處理
        - *Goal*: 提升使用者體驗
        - *Details*:
          - 顯示 loading spinner
          - 顯示錯誤訊息 (網路錯誤、伺服器錯誤)
          - 空狀態提示 (無手冊時)

    - [x] 9.3. 成功操作提示
        - *Goal*: 給予即時反饋
        - *Details*:
          - 新增/編輯/刪除成功後顯示 Toast 提示
          - 操作後自動重新整理列表

## Phase 4: 前台介面開發 (2-3 天)

- [ ] **10. 重構前台手冊列表頁**
    - [x] 10.1. 建立歡迎文字組件
        - *Goal*: 顯示固定的客戶歡迎詞
        - *Details*:
          - 建立 `src/components/front/WelcomeMessage.tsx`
          - 顯示固定文字內容
          - 適當的排版與樣式
        - *Requirements*: 前台功能 - 歡迎文字區塊

    - [x] 10.2. 重構 /service/handbook/page.tsx
        - *Goal*: 更新為顯示手冊列表
        - *Details*:
          - 更新 `src/app/(front)/service/handbook/page.tsx`
          - 呼叫 /api/handbooks 獲取手冊列表
          - 移除舊的 Document 相關邏輯
          - 顯示 WelcomeMessage 組件
          - 顯示手冊網格
        - *Requirements*: 前台功能 - 手冊列表

    - [x] 10.3. 建立 HandbookCard 組件
        - *Goal*: 顯示單一手冊卡片
        - *Details*:
          - 建立 `src/components/front/HandbookCard.tsx`
          - 顯示封面圖片、手冊標題
          - 點擊跳轉到詳情頁
          - 響應式設計: 手機 2欄, 平板 3欄, 桌面 3-4欄
        - *Requirements*: 前台功能 - 手冊卡片

    - [x] 10.4. 實作載入與錯誤狀態
        - *Goal*: 處理各種狀態
        - *Details*:
          - Loading 狀態: 顯示 skeleton 或 spinner
          - Error 狀態: 顯示錯誤訊息
          - Empty 狀態: 顯示 "目前尚無交屋手冊"
        - *Requirements*: 前台功能 - 錯誤處理

- [x] **11. 建立前台手冊詳情頁**
    - [x] 11.1. 建立 /service/handbook/[id]/page.tsx
        - *Goal*: 顯示手冊詳情與密碼驗證介面
        - *Details*:
          - 建立 `src/app/(front)/service/handbook/[id]/page.tsx`
          - 呼叫 /api/handbooks/[id] 獲取手冊資訊
          - 顯示封面圖片、標題
          - 管理驗證狀態 (isVerified)
        - *Requirements*: 前台功能 - 手冊詳情頁

    - [x] 11.2. 建立 PasswordForm 組件
        - *Goal*: 密碼輸入與驗證
        - *Details*:
          - 建立 `src/components/front/PasswordForm.tsx`
          - 密碼輸入欄位
          - "進入手冊" 按鈕
          - 錯誤提示顯示區域
          - 提交時呼叫 /api/handbooks/[id]/verify
        - *Requirements*: 前台功能 - 密碼驗證

    - [x] 11.3. 實作 sessionStorage 驗證記錄
        - *Goal*: 避免重複輸入密碼
        - *Details*:
          - 驗證成功後: `sessionStorage.setItem('handbook_${id}_verified', 'true')`
          - 頁面載入時檢查 sessionStorage
          - 若已驗證,直接顯示文件列表
        - *Requirements*: 前台功能 - 免重複輸入密碼

    - [x] 11.4. 建立 FileList 組件
        - *Goal*: 顯示文件列表
        - *Details*:
          - 建立 `src/components/front/FileList.tsx`
          - 呼叫 /api/handbooks/[id]/files 獲取文件
          - 顯示文件列表
          - 每個文件: 圖標、名稱、大小、下載按鈕
        - *Requirements*: 前台功能 - 文件列表

    - [x] 11.5. 建立 FileItem 組件
        - *Goal*: 顯示單一文件項目
        - *Details*:
          - 建立 `src/components/front/FileItem.tsx`
          - 根據文件類型顯示圖標 (PDF/DOC/PPT)
          - 顯示文件名稱、大小
          - 下載按鈕
          - 點擊下載呼叫 download API + window.open
        - *Requirements*: 前台功能 - 文件下載

    - [x] 11.6. 實作下載功能
        - *Goal*: 下載文件並記錄次數
        - *Details*:
          - 點擊下載按鈕時
          - 先呼叫 POST /api/handbooks/[id]/files/[fileId]/download
          - 再執行 window.open(fileUrl, '_blank') 開啟下載
          - 相容 iOS Safari
        - *Requirements*: 前台功能 - 下載追蹤

- [ ] **12. 前台介面優化與測試**
    - [x] 12.1. 響應式設計測試
        - *Goal*: 確保在各裝置正常顯示
        - *Details*:
          - 測試手機、平板、桌面視圖
          - 調整網格佈局、字體大小、間距

    - [x] 12.2. 無障礙優化
        - *Goal*: 提升無障礙性
        - *Details*:
          - 圖片新增 alt 屬性
          - 表單欄位新增 label
          - 鍵盤導航支援

    - [x] 12.3. 效能優化
        - *Goal*: 提升載入速度
        - *Details*:
          - 圖片使用 Next.js Image 組件
          - 啟用 lazy loading
          - 測試載入時間 < 2秒

    - [x] 12.4. 密碼驗證流程測試
        - *Goal*: 確保驗證流程順暢
        - *Details*:
          - 測試正確密碼流程
          - 測試錯誤密碼提示
          - 測試 sessionStorage 記憶功能
          - 測試清除 sessionStorage 後重新驗證

## Phase 5: 整合測試與部署 (1-2 天)

- [ ] **13. 完整功能測試**
    - [x] 13.1. 端對端測試 - 後台流程
        - *Goal*: 驗證完整的後台操作流程
        - *Details*:
          - 新增手冊 → 上傳文件 → 編輯手冊 → 調整排序 → 刪除文件 → 刪除手冊
          - 測試專案關聯功能
          - 測試搜尋與篩選

    - [x] 13.2. 端對端測試 - 前台流程
        - *Goal*: 驗證完整的前台使用流程
        - *Details*:
          - 瀏覽手冊列表 → 點擊手冊 → 輸入密碼 → 查看文件 → 下載文件
          - 測試密碼錯誤處理
          - 測試 session 記憶功能

    - [x] 13.3. 資料一致性測試
        - *Goal*: 確保資料庫關聯正確
        - *Details*:
          - 刪除專案,檢查手冊 projectId 是否設為 null
          - 刪除手冊,檢查文件是否 cascade 刪除
          - 檢查外鍵約束運作正常

    - [x] 13.4. 安全性檢查
        - *Goal*: 確保無安全漏洞
        - *Details*:
          - 驗證前台 API 不回傳密碼
          - 檢查資料庫密碼已加密
          - 測試未認證使用者無法訪問後台 API
          - 測試檔案上傳限制

- [ ] **14. Bug 修復與優化**
    - [x] 14.1. 修復測試發現的 bugs
        - *Goal*: 解決所有測試中發現的問題
        - *Details*:
          - 記錄所有發現的 bugs
          - 按優先級修復
          - 重新測試修復項目

    - [x] 14.2. 效能優化
        - *Goal*: 提升整體效能
        - *Details*:
          - 優化資料庫查詢 (加索引)
          - 減少不必要的 re-render
          - 優化圖片載入

    - [x] 14.3. 使用者體驗優化
        - *Goal*: 改善互動體驗
        - *Details*:
          - 調整動畫與過渡效果
          - 優化錯誤訊息文字
          - 改善 loading 狀態顯示

- [ ] **15. 文檔與部署**
    - [x] 15.1. 更新 README
        - *Goal*: 記錄新功能
        - *Details*:
          - 在 README 新增交屋手冊功能說明
          - 記錄環境變數設定 (如有新增)
          - 更新 API 文檔

    - [x] 15.2. 建立使用手冊
        - *Goal*: 提供管理員操作指南
        - *Details*:
          - 撰寫後台操作說明
          - 包含截圖與步驟說明
          - 建議密碼管理方式

    - [x] 15.3. 部署到生產環境
        - *Goal*: 將功能上線
        - *Details*:
          - 執行生產環境資料庫遷移
          - 部署程式碼
          - 驗證功能正常運作
          - 監控錯誤日誌

## Task Dependencies

**必須依序執行**:
- Phase 1 → Phase 2 → Phase 3/4 (可平行) → Phase 5
- 資料庫遷移 (1.4) 必須在所有 API 開發之前完成
- 型別定義 (2) 必須在前後端開發之前完成
- 前台 APIs (3) 必須在前台介面 (10-12) 之前完成
- 後台 APIs (4) 必須在後台介面 (6-9) 之前完成

**可平行執行**:
- Phase 3 (後台介面) 與 Phase 4 (前台介面) 可同時進行
- 各 API routes 之間可平行開發
- 前台組件之間可平行開發
- 後台頁面之間可平行開發

**關鍵里程碑**:
- Phase 1 完成: 資料庫結構就緒
- Phase 2 完成: 所有 API 可用
- Phase 3+4 完成: 功能開發完成
- Phase 5 完成: 測試通過,準備上線

## Estimated Timeline

### Phase 1: 資料庫與型別定義
- Task 1: 更新 Prisma Schema - **2 小時**
- Task 2: 建立型別定義 - **1 小時**
- **Phase 1 總計: 3 小時 (0.5 天)**

### Phase 2: 後端 API 開發
- Task 3: 建立前台 API Routes - **6 小時**
- Task 4: 建立後台 Admin API Routes - **10 小時**
- Task 5: API 測試 - **4 小時**
- **Phase 2 總計: 20 小時 (2.5 天)**

### Phase 3: 後台介面開發
- Task 6: 建立後台手冊列表頁 - **6 小時**
- Task 7: 建立後台手冊表單頁 - **8 小時**
- Task 8: 建立後台文件管理頁 - **10 小時**
- Task 9: 後台介面優化與測試 - **4 小時**
- **Phase 3 總計: 28 小時 (3.5 天)**

### Phase 4: 前台介面開發
- Task 10: 重構前台手冊列表頁 - **6 小時**
- Task 11: 建立前台手冊詳情頁 - **10 小時**
- Task 12: 前台介面優化與測試 - **4 小時**
- **Phase 4 總計: 20 小時 (2.5 天)**

### Phase 5: 整合測試與部署
- Task 13: 完整功能測試 - **6 小時**
- Task 14: Bug 修復與優化 - **6 小時**
- Task 15: 文檔與部署 - **4 小時**
- **Phase 5 總計: 16 小時 (2 天)**

---

## **總計工時: 87 小時 (約 11 工作天)**

**建議開發節奏** (每天工作 8 小時):
- Day 1: Phase 1 + 部分 Phase 2
- Day 2-3: 完成 Phase 2
- Day 4-6: Phase 3 (後台介面)
- Day 7-9: Phase 4 (前台介面)
- Day 10-11: Phase 5 (測試與部署)

**風險緩衝**: 建議預留 2-3 天處理未預期問題
