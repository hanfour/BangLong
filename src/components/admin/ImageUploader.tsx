'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, X, Loader2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProjectImage } from '@/types/global';

interface SortableImageProps {
  image: ProjectImage;
  onRemove: (imageUrl: string) => void;
}

function SortableImage({ image, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-full h-32 group"
    >
      <Image
        src={image.imageUrl}
        alt={`Project image`}
        fill
        className="object-cover rounded-md"
      />
      <div className="absolute inset-0 group-hover:bg-black/40 transition-opacity duration-200 flex items-center justify-center">
        <button
          type="button"
          onClick={() => onRemove(image.imageUrl)}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
        <div {...attributes} {...listeners} className="cursor-grab touch-none p-2 opacity-0 group-hover:opacity-100">
          <GripVertical className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

interface ImageUploaderProps {
  images: ProjectImage[];
  onImagesChange: (images: ProjectImage[]) => void;
  maxFiles?: number;
}

export default function ImageUploader({ images, onImagesChange, maxFiles = 10 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    setUploadError(null);

    const uploadedImages: ProjectImage[] = [];

    for (const file of Array.from(files)) {
        if (images.length + uploadedImages.length >= maxFiles) {
            setUploadError(`最多只能上傳 ${maxFiles} 張圖片`);
            break;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError('請上傳 JPG、PNG 或 WebP 格式的圖片');
            continue;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('圖片大小不能超過 5MB');
            continue;
        }

        try {
            const timestamp = new Date().getTime();
            const fileExt = file.name.split('.').pop() || 'jpg';
            const safeFileName = `project-image-${timestamp}.${fileExt}`;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'projects');

            const response = await fetch(`/api/upload?filename=${encodeURIComponent(safeFileName)}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '上傳圖片失敗');
            }
            
            uploadedImages.push({
                id: `new-${Date.now()}`, // 給新圖片一個暫時的唯一 ID
                projectId: '',
                imageUrl: data.url,
                order: 0,
            });

        } catch (error) {
            console.error('上傳圖片失敗:', error);
            setUploadError('上傳圖片失敗，請稍後再試');
            break; 
        }
    }
    
    if (uploadedImages.length > 0) {
        const newImages = [...images, ...uploadedImages].map((img, index) => ({
            ...img,
            order: index + 1,
        }));
        onImagesChange(newImages);
    }

    setIsUploading(false);
  };

  const handleRemoveImage = (imageUrl: string) => {
    const newImages = images
      .filter(img => img.imageUrl !== imageUrl)
      .map((img, index) => ({ ...img, order: index + 1 }));
    onImagesChange(newImages);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(img => img.id === active.id);
      const newIndex = images.findIndex(img => img.id === over.id);
      
      const newSortedImages = arrayMove(images, oldIndex, newIndex).map((img, index) => ({
        ...img,
        order: index + 1,
      }));

      onImagesChange(newSortedImages);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        專案圖片 <span className="text-red-500">*</span>
      </label>
      <div className="border border-dashed border-gray-300 rounded-md p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(image => (
                <SortableImage key={image.id} image={image} onRemove={handleRemoveImage} />
              ))}
              {images.length < maxFiles && (
                <label className="w-full h-32 flex flex-col items-center justify-center bg-gray-50 text-amber-800 rounded-md shadow-sm tracking-wide cursor-pointer hover:bg-amber-100 border-2 border-dashed border-gray-300">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Plus className="w-8 h-8" />
                  )}
                  <span className="mt-2 text-sm leading-normal">
                    {isUploading ? '上傳中...' : '新增圖片'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    multiple
                  />
                </label>
              )}
            </div>
          </SortableContext>
        </DndContext>
        {uploadError && (
          <p className="text-red-600 text-sm mt-2">{uploadError}</p>
        )}
        <p className="text-xs text-gray-500 text-center mt-4">
          支援 JPG、PNG 和 WebP 格式，最大 5MB。可拖曳排序。
        </p>
      </div>
    </div>
  );
}