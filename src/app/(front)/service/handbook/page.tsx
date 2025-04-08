'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/front/Breadcrumb';
import ContentBlock from '@/components/front/ContentBlock';
import { Document, Project } from '@/types/global';
import { Loader2, File, FileText, FileImage } from 'lucide-react';

interface ProjectWithDocuments extends Project {
  documents?: Document[];
}

export default function HandbookPage() {
  const [projects, setProjects] = useState<ProjectWithDocuments[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 獲取專案與文檔
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 獲取交屋手冊文檔
        const docsResponse = await fetch('/api/documents?category=handbook');
        
        if (!docsResponse.ok) {
          const errorData = await docsResponse.json().catch(() => ({}));
          throw new Error(errorData.details || errorData.error || '無法獲取交屋手冊資訊');
        }
        
        const docsData = await docsResponse.json();
        const handbooks = docsData.documents || [];
        setDocuments(handbooks);
        
        // 收集所有相關的專案ID
        const projectIds = new Set<string>();
        handbooks.forEach((doc: Document) => {
          if (doc.projectId) {
            projectIds.add(doc.projectId);
          }
        });
        
        // 如果有關聯的專案，獲取專案詳情
        if (projectIds.size > 0) {
          // 通常應有單獨的API獲取多個專案，這裡簡化處理
          const projectsResponse = await fetch('/api/projects');
          
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            const allProjects = projectsData.projects || [];
            
            // 過濾出有交屋手冊的專案
            const projectsWithHandbooks = allProjects.filter((project: Project) => 
              projectIds.has(project.id)
            );
            
            // 為每個專案添加其文檔
            const projectsWithDocs = projectsWithHandbooks.map((project: Project) => {
              const projectDocs = handbooks.filter((doc: Document) => doc.projectId === project.id);
              return {
                ...project,
                documents: projectDocs
              };
            });
            
            setProjects(projectsWithDocs);
          }
        }
      } catch (err) {
        console.error('Error fetching handbooks:', err);
        setError('無法獲取交屋手冊資訊，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 獲取文檔圖標
  const getDocumentIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    
    switch (type) {
      case 'pdf':
        return <File className="h-5 w-5 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-5 w-5 text-purple-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  // 選擇專案查看其文檔
  const handleProjectSelect = (documentId: string) => {
    // 找到選擇的文件
    const selectedDoc = documents.find(doc => doc.id === documentId);
    
    if (selectedDoc && selectedDoc.fileUrl) {
      // 彈出確認對話框
      if (window.confirm(`確定要下載 ${selectedDoc.title} 交屋手冊嗎？`)) {
        // 如果用戶確認，則執行下載
        window.open(selectedDoc.fileUrl, '_blank');
        
        // 選擇性地記錄下載事件
        try {
          fetch(`/api/documents/${documentId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'download' }),
          });
        } catch (error) {
          console.error('無法記錄下載:', error);
        }
      }
    } else {
      // 如果找不到文件或URL，則執行原本的選擇邏輯
      setSelectedProject(selectedProject === documentId ? null : documentId);
    }
  };

  // 過濾當前顯示的文檔
  const filteredDocuments = selectedProject
    ? documents.filter(doc => doc.projectId === selectedProject)
    : documents.filter(doc => !doc.projectId); // 顯示未關聯專案的文檔

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-160px)] lg:min-h-[calc(100vh-220px)]">
      {/* 手機版麵包屑在頁面頂部顯示 */}
      <div className="lg:hidden w-full mb-4">
        <Breadcrumb 
          parentTitle="尊榮售服" 
          parentTitleEn="SERVICE" 
          currentTitle="交屋手冊" 
          parentPath="/service"
          parentIsClickable={false}
        />
      </div>
      
      <div className="flex flex-col lg:flex-row lg:justify-between w-full">
        {/* 左側麵包屑 - 只在桌面版顯示 */}
        <div className="hidden lg:block mb-8 lg:mb-0">
          <Breadcrumb 
            parentTitle="尊榮售服" 
            parentTitleEn="SERVICE" 
            currentTitle="交屋手冊" 
            parentPath="/service"
            parentIsClickable={false}
          />
        </div>
        
        {/* 右側内容 */}
        <div className="w-full lg:flex-1 lg:pl-8 pb-12">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
              <span className="ml-2 text-gray-600">載入交屋手冊資訊...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="w-full">
              {/* 專案列表區域 */}
              {filteredDocuments.length > 0 && (
                <div className="mb-10">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8 lg:gap-16">
                    {filteredDocuments.map((doc) => (
                      <div 
                        key={doc.id} 
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedProject === doc.id ? 'scale-105 shadow-lg' : 'hover:scale-105'
                        }`}
                        onClick={() => handleProjectSelect(doc.id)}
                      >
                        <ContentBlock 
                          TextClassName={`[&_h3]:text-center [&_h3]:text-black [&_h3]:text-sm [&_h3]:lg:text-xl ${
                            selectedProject === doc.id ? '[&_h3]:text-amber-800' : ''
                          }`}
                          ImageClassName="[&>div]:pt-[142%]"
                          layout="image-above-text"
                          imageSrc={doc.imageUrl || doc.project?.imageUrl || ''}
                          imageAlt={doc.title || doc.project?.title || ''}
                          title1={doc.title + '︱交屋手冊' || doc.project?.title + '︱交屋手冊'}
                          text1={""}
                        />
                      </div>
                    ))}
                    {/* 動態填充至少顯示3個區塊 */}
                    {Array.from({ length: Math.max(0, 3 - filteredDocuments.length) }).map((_, index) => (
                      <div key={`empty-${index}`} className='mb-12'>
                        <div className="relative w-full pt-[142%] bg-[#b5aaa3]">
                          <div className="absolute w-full h-full top-0 left-0 flex justify-center items-center">
                            <p className="text-[#7a6a56]">未來依個案上傳</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
