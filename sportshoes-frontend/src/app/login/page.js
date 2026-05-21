'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: 'admin@sportshoes.com',
      password: 'Admin123!',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Intentando login con:', data);
      
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('Token guardado:', token.substring(0, 50) + '...');
        console.log('Usuario guardado:', user);
        
        toast.success('¡Inicio de sesión exitoso!');
        
        console.log('Rol del usuario:', user.role);
        
        if (user.role === 'ADMIN' || user.role === 'GESTOR') {
          console.log('Redirigiendo a /admin');
          window.location.href = '/admin';
        } else {
          console.log('Redirigiendo a /');
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Error de login:', error);
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-[#FAFAFA]">
      <div className="max-w-md w-full">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-[#666666] hover:text-[#1A1A1A] mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a la tienda
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00FF88] to-[#7C3AED] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00FF88]/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Iniciar sesión</h2>
            <p className="mt-2 text-sm text-[#666666]">
              Accede a tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                         placeholder-[#999999] focus:outline-none focus:border-[#00FF88] focus:bg-white
                         transition-all duration-200"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-[#FF6B6B] flex items-center gap-1">
                  <span className="w-1 h-1 bg-[#FF6B6B] rounded-full" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'La contraseña es requerida' })}
                  className="w-full px-4 py-3 pr-12 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                           placeholder-[#999999] focus:outline-none focus:border-[#00FF88] focus:bg-white
                           transition-all duration-200"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#999999] hover:text-[#1A1A1A] transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-[#FF6B6B] flex items-center gap-1">
                  <span className="w-1 h-1 bg-[#FF6B6B] rounded-full" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] text-white rounded-xl font-semibold
                       hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-[#F5F5F5] rounded-xl border border-[#E8E8E8]">
            <p className="text-xs font-semibold text-[#1A1A1A] mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#FFD93D] rounded-full" />
              Credenciales de prueba
            </p>
            <div className="space-y-1.5 text-xs text-[#666666]">
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#7C3AED]/10 rounded flex items-center justify-center text-[10px] text-[#7C3AED] font-bold">A</span>
                <span><strong>Admin:</strong> admin@sportshoes.com / Admin123!</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#00FF88]/10 rounded flex items-center justify-center text-[10px] text-[#00FF88] font-bold">G</span>
                <span><strong>Gestor:</strong> gestion@sportshoes.com / Admin123!</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}