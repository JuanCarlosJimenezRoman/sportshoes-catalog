'use client';
import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#333',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          borderRadius: '0.75rem',
          padding: '1rem',
        },
        success: {
          iconTheme: {
            primary: '#2563eb',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}