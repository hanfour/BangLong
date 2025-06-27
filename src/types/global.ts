export type Carousel = {
  id: string;
  title?: string;
  imageUrl: string;
  linkUrl?: string;
  linkText?: string;
  description?: string;
  order: number;
  isActive: boolean;
  textPosition: string; // topLeft, topCenter, topRight, centerLeft, center, centerRight, bottomLeft, bottomCenter, bottomRight
  textDirection: string; // horizontal, vertical
  createdAt: Date;
  updatedAt: Date;
};

export type Project = {
  id: string;
  title: string;
  description?: string;
  category: 'new' | 'classic' | 'future'; // 新案鑑賞、歷年經典、未來計畫
  details?: ProjectDetails;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: ProjectImage[];
};

export type ProjectImage = {
  id: string;
  imageUrl: string;
  order: number;
  projectId: string;
};

export type ProjectDetailItem = {
  label: string; // 如：位置、規模、基地面積等
  value: string; // 對應的值
};

export type ProjectDetails = {
  items: ProjectDetailItem[]; // 使用編號而非固定 key name 的詳細資訊列表
  features?: string[]; // 特色設施
  description?: string; // 詳細描述
  additionalImages?: string[]; // 額外圖片
};

export type Document = {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  imageUrl?: string; // 封面圖片
  fileType: string; // pdf, docx 等
  category: string; // 交屋手冊、售服流程等
  order: number;
  isActive: boolean;
  projectId?: string;
  project?: {
    title: string;
    images: { imageUrl: string }[];
  };
  createdAt: Date;
  updatedAt: Date;
};