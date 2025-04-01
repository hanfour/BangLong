'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useRef } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, AlignLeft, 
  AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, 
  Image as ImageIcon, List, ListOrdered, RemoveFormatting, 
  Heading1, Heading2, Paperclip, Type, Palette, Undo, Redo
} from 'lucide-react';

type TiptapEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const MenuButton = ({ 
  onClick, 
  title, 
  isActive = false,
  disabled = false,
  children 
}: { 
  onClick: () => void, 
  title: string, 
  isActive?: boolean,
  disabled?: boolean,
  children: React.ReactNode 
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-1 rounded transition-colors ${
      isActive ? 'bg-amber-100 text-amber-700' : 
      disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
);

export default function TiptapEditor({ value = '', onChange, placeholder }: TiptapEditorProps) {
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [url, setUrl] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: placeholder || '輸入內容...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
      },
    },
  });

  const handleInsertLink = () => {
    if (!editor || !url) return;
    
    // If there's no selection, insert the URL as the link text
    if (editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" target="_blank">${url}</a>`)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url, target: '_blank' })
        .run();
    }
    
    setUrl('');
    setShowLinkMenu(false);
  };

  const handleInsertImage = (imgUrl: string) => {
    if (!editor || !imgUrl) return;
    
    editor
      .chain()
      .focus()
      .setImage({ src: imgUrl, alt: 'Image' })
      .run();
    
    setShowImageMenu(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // 顯示上傳指示器或者禁用按鈕等...
      
      // 創建 FormData 對象
      const formData = new FormData();
      formData.append('file', file);
      
      // 生成隨機文件名
      const fileExt = file.name.split('.').pop();
      const randomName = `editor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // 上傳圖片到服務器
      const uploadResponse = await fetch(`/api/upload?filename=${randomName}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('圖片上傳失敗');
      }
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.url) {
        throw new Error('上傳成功但未獲得URL');
      }
      
      // 使用服務器返回的 URL 插入圖片
      handleInsertImage(uploadResult.url);
      
    } catch (error) {
      console.error('上傳圖片失敗:', error);
      alert('圖片上傳失敗，請重試');
      
      // 如果上傳失敗，回退到 Base64 方式（僅用於預覽）
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleInsertImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    
    try {
      // 創建 FormData 對象
      const formData = new FormData();
      formData.append('file', file);
      
      // 生成隨機文件名，保留原始檔名
      const fileExt = file.name.split('.').pop();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // 安全化檔名
      const randomName = `attachment_${Date.now()}_${safeFileName}`;
      
      // 上傳附件到服務器
      const uploadResponse = await fetch(`/api/upload?filename=${randomName}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('附件上傳失敗');
      }
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.url) {
        throw new Error('上傳成功但未獲得URL');
      }
      
      // 使用服務器返回的 URL 創建連結
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${uploadResult.url}" class="attachment" target="_blank" title="${file.name}">${file.name}</a>`)
        .run();
      
    } catch (error) {
      console.error('上傳附件失敗:', error);
      alert('附件上傳失敗，請重試');
      
      // 如果上傳失敗，創建一個無效連結作為佔位符
      editor
        .chain()
        .focus()
        .insertContent(`<a href="#" class="attachment" title="${file.name} (上傳失敗)">${file.name} (上傳失敗)</a>`)
        .run();
    }
    
    setShowAttachmentMenu(false);
  };

  const colors = [
    { color: '#000000', name: '黑色' },
    { color: '#FF0000', name: '紅色' },
    { color: '#0000FF', name: '藍色' },
    { color: '#008000', name: '綠色' },
    { color: '#FFA500', name: '橙色' },
    { color: '#800080', name: '紫色' },
    { color: '#A52A2A', name: '棕色' },
    { color: '#808080', name: '灰色' },
  ];

  const headingSizes = [
    { level: 1, name: '大標題' },
    { level: 2, name: '中標題' },
    { level: 3, name: '小標題' },
    { level: 0, name: '正常文字' }
  ];

  if (!editor) return null;

  return (
    <div className="tiptap-editor-container border border-gray-300 rounded-md">
      <div className="bg-gray-100 p-2 flex flex-wrap items-center gap-1 border-b border-gray-300">
        {/* Text Formatting */}
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="粗體"
          isActive={editor.isActive('bold')}
        >
          <Bold size={16} />
        </MenuButton>
        
        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="斜體"
          isActive={editor.isActive('italic')}
        >
          <Italic size={16} />
        </MenuButton>
        
        <MenuButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="下底線"
          isActive={editor.isActive('underline')}
        >
          <UnderlineIcon size={16} />
        </MenuButton>
        
        <MenuButton 
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="刪除線"
          isActive={editor.isActive('strike')}
        >
          <Strikethrough size={16} />
        </MenuButton>
        
        {/* Text Size Dropdown */}
        <div className="relative">
          <MenuButton 
            onClick={() => setShowHeadingMenu(!showHeadingMenu)}
            title="文字大小"
            isActive={showHeadingMenu || editor.isActive('heading')}
          >
            <Type size={16} />
          </MenuButton>
          
          {showHeadingMenu && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white shadow-lg rounded-md z-10 w-32">
              {headingSizes.map((heading) => (
                <button
                  key={heading.level}
                  type="button"
                  onClick={() => {
                    if (heading.level === 0) {
                      editor.chain().focus().setParagraph().run();
                    } else {
                      editor.chain().focus().toggleHeading({ level: heading.level }).run();
                    }
                    setShowHeadingMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded-md text-sm ${
                    (heading.level === 0 && !editor.isActive('heading')) || 
                    (heading.level > 0 && editor.isActive('heading', { level: heading.level }))
                      ? 'bg-amber-100 text-amber-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {heading.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Text Color Dropdown */}
        <div className="relative">
          <MenuButton 
            onClick={() => setShowColorMenu(!showColorMenu)}
            title="文字顏色"
            isActive={showColorMenu}
          >
            <Palette size={16} />
          </MenuButton>
          
          {showColorMenu && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white shadow-lg rounded-md z-10 w-32">
              <div className="grid grid-cols-4 gap-1">
                {colors.map((colorObj) => (
                  <button
                    key={colorObj.color}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(colorObj.color).run();
                      setShowColorMenu(false);
                    }}
                    className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center"
                    title={colorObj.name}
                    style={{ backgroundColor: colorObj.color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mx-1 w-px h-6 bg-gray-300"></div>
        
        {/* Text Alignment */}
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="靠左對齊"
          isActive={editor.isActive({ textAlign: 'left' })}
        >
          <AlignLeft size={16} />
        </MenuButton>
        
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="置中對齊"
          isActive={editor.isActive({ textAlign: 'center' })}
        >
          <AlignCenter size={16} />
        </MenuButton>
        
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="靠右對齊"
          isActive={editor.isActive({ textAlign: 'right' })}
        >
          <AlignRight size={16} />
        </MenuButton>
        
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="左右對齊"
          isActive={editor.isActive({ textAlign: 'justify' })}
        >
          <AlignJustify size={16} />
        </MenuButton>
        
        <div className="mx-1 w-px h-6 bg-gray-300"></div>
        
        {/* Lists */}
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="項目清單"
          isActive={editor.isActive('bulletList')}
        >
          <List size={16} />
        </MenuButton>
        
        <MenuButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="編號清單"
          isActive={editor.isActive('orderedList')}
        >
          <ListOrdered size={16} />
        </MenuButton>
        
        <div className="mx-1 w-px h-6 bg-gray-300"></div>
        
        {/* Media and Links */}
        <div className="relative">
          <MenuButton 
            onClick={() => setShowLinkMenu(!showLinkMenu)}
            title="插入連結"
            isActive={showLinkMenu || editor.isActive('link')}
          >
            <LinkIcon size={16} />
          </MenuButton>
          
          {showLinkMenu && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white shadow-lg rounded-md z-10 w-60">
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="輸入連結 URL"
                  className="px-2 py-1 border border-gray-300 rounded-md"
                  autoFocus
                />
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleInsertLink}
                    className="px-2 py-1 bg-amber-700 text-white rounded-md text-sm"
                  >
                    確認
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkMenu(false)}
                    className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <MenuButton 
            onClick={() => setShowImageMenu(!showImageMenu)}
            title="插入圖片"
            isActive={showImageMenu}
          >
            <ImageIcon size={16} />
          </MenuButton>
          
          {showImageMenu && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white shadow-lg rounded-md z-10 w-60">
              <div className="flex flex-col space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="輸入圖片 URL"
                    className="px-2 py-1 border border-gray-300 rounded-md flex-1 min-w-[100px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleInsertImage(url)}
                    className="px-2 py-1 bg-amber-700 text-white rounded-md text-sm whitespace-nowrap"
                  >
                    插入
                  </button>
                </div>
                <div className="text-center text-gray-500 text-xs">或</div>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                >
                  上傳圖片
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowImageMenu(false)}
                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <MenuButton 
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            title="插入附件"
            isActive={showAttachmentMenu}
          >
            <Paperclip size={16} />
          </MenuButton>
          
          {showAttachmentMenu && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white shadow-lg rounded-md z-10 w-60">
              <div className="flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                >
                  選擇檔案
                </button>
                <input
                  ref={attachmentInputRef}
                  type="file"
                  onChange={handleAttachmentUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowAttachmentMenu(false)}
                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 w-px h-6 bg-gray-300"></div>
        
        <MenuButton 
          onClick={() => editor.chain().focus().undo().run()}
          title="復原"
          disabled={!editor.can().undo()}
        >
          <Undo size={16} />
        </MenuButton>
        
        <MenuButton 
          onClick={() => editor.chain().focus().redo().run()}
          title="重做"
          disabled={!editor.can().redo()}
        >
          <Redo size={16} />
        </MenuButton>
        
        <div className="mx-1 w-px h-6 bg-gray-300"></div>
        
        <MenuButton 
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="移除格式"
        >
          <RemoveFormatting size={16} />
        </MenuButton>
      </div>
      
      <EditorContent editor={editor} className="min-h-[120px]" />
    </div>
  );
}