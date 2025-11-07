// 交屋手冊型別定義

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
  projectId?: string | null;
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
  fileSize?: number | null;
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
  projectId?: string | null;
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
