'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/front/Breadcrumb';
import ContentBlock from '@/components/front/ContentBlock';
import { Document, Project } from '@/types/global';
import { Loader2, Download, File, FileText, FileImage, FilePdf } from 'lucide-react';

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
          throw new Error('無法獲取交屋手冊資訊');
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
        return <FilePdf className="h-5 w-5 text-red-600" />;
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
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
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
              {projects.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">個案交屋手冊</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8 lg:gap-16">
                    {projects.map((project) => (
                      <div 
                        key={project.id} 
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedProject === project.id ? 'scale-105 shadow-lg' : 'hover:scale-105'
                        }`}
                        onClick={() => handleProjectSelect(project.id)}
                      >
                        <ContentBlock 
                          TextClassName={`[&_h3]:text-center [&_h3]:text-black [&_h3]:text-sm [&_h3]:lg:text-xl ${
                            selectedProject === project.id ? '[&_h3]:text-amber-800' : ''
                          }`}
                          ImageClassName="[&>div]:pt-[142%]"
                          layout="image-above-text"
                          imageSrc={project.imageUrl}
                          imageAlt={project.title}
                          title1={project.title + '︱交屋手冊'}
                          text1={""}
                        />
                      </div>
                    ))}
                    {/* 動態填充至少顯示3個區塊 */}
                    {Array.from({ length: Math.max(0, 3 - projects.length) }).map((_, index) => (
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
              
              {/* 文檔列表區域 */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {selectedProject 
                    ? projects.find(p => p.id === selectedProject)?.title + ' 文件清單' 
                    : '一般交屋文件'}
                </h2>
                
                {filteredDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                    <FileText className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">暫無文件</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} className="flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                        {/* 圖片區域 */}
                        <div className="relative h-48 overflow-hidden">
                          {doc.imageUrl ? (
                            <img 
                              src={doc.imageUrl} 
                              alt={doc.title} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : doc.project?.imageUrl ? (
                            <img 
                              src={doc.project.imageUrl} 
                              alt={doc.project.title} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-100">
                              {getDocumentIcon(doc.fileType)}
                              <span className="ml-2 text-gray-500 font-medium">
                                {doc.fileType.toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-90 text-gray-800">
                              {doc.fileType.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        {/* 內容區域 */}
                        <div className="p-4 flex-grow">
                          <h3 className="font-medium text-gray-900 text-lg">{doc.title}</h3>
                          {doc.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{doc.description}</p>
                          )}
                        </div>
                        
                        {/* 下載按鈕 */}
                        <div className="p-4 pt-0 border-t border-gray-100">
                          <a 
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full py-2 px-4 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md transition-colors"
                            download
                          >
                            <Download className="h-4 w-4 mr-2" />
                            下載文件
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
