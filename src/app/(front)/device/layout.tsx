import React from 'react';

export default function DeviceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-9/10 mx-auto px-4 py-8 lg:py-16">
      {children}
    </div>
  );
}