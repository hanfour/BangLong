import { HandbookFile } from '@/types/handbook';
import { File, FileText, FileImage, Download } from 'lucide-react';

interface FileListProps {
  files: HandbookFile[];
  onDownload: (fileId: string, fileUrl: string) => void;
}

export default function FileList({ files, onDownload }: FileListProps) {
  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    switch (type) {
      case 'pdf':
        return <File className="h-8 w-8 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-8 w-8 text-purple-600" />;
      default:
        return <File className="h-8 w-8 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gray-50 border border-gray-200">
        <p className="text-gray-500">此手冊目前沒有文件</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white border border-gray-200 hover:border-[#a48b78] transition-all"
        >
          <div className="flex items-center space-x-4 flex-1 mb-3 sm:mb-0">
            <div className="flex-shrink-0">{getFileIcon(file.fileType)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-medium text-black truncate">
                {file.title}
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {file.fileType.toUpperCase()}
                {file.fileSize && ` • ${formatFileSize(file.fileSize)}`}
                {file.downloadCount > 0 && ` • 已下載 ${file.downloadCount} 次`}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDownload(file.id, file.fileUrl)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-amber-800 text-white hover:bg-amber-900 active:bg-amber-950 transition-colors font-medium"
          >
            <Download className="h-4 w-4" />
            <span className="font-medium">下載</span>
          </button>
        </div>
      ))}
    </div>
  );
}
