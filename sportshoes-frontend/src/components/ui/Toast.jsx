'use client';
import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1A1A1A',
          color: '#FFFFFF',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          borderRadius: '1rem',
          padding: '1rem 1.25rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          border: '1px solid #333333',
        },
        success: {
          iconTheme: {
            primary: '#00FF88',
            secondary: '#1A1A1A',
          },
        },
        error: {
          iconTheme: {
            primary: '#FF6B6B',
            secondary: '#1A1A1A',
          },
        },
      }}
    />
  );
}