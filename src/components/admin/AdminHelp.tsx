import React, { useState } from 'react';

interface AdminHelpProps {
  content: string;
}

const AdminHelp: React.FC<AdminHelpProps> = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 border border-gray-300 rounded p-3 bg-gray-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="font-semibold text-blue-600 hover:underline focus:outline-none"
      >
        {isOpen ? '隱藏操作說明 ▲' : '顯示操作說明 ▼'}
      </button>
      {isOpen && (
        <div className="mt-2 whitespace-pre-wrap text-gray-800">
          {content}
        </div>
      )}
    </div>
  );
};

export default AdminHelp;
