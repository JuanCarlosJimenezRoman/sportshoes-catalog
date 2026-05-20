'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
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
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('Token guardado:', token.substring(0, 50) + '...');
        console.log('Usuario guardado:', user);
        
        toast.success('¡Inicio de sesión exitoso!');
        
        // Verificar el rol y redirigir
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede a tu cuenta para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="input-field"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'La contraseña es requerida' })}
                  className="input-field pr-10"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center py-3"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Credenciales de prueba:
          </p>
          <div className="space-y-1 text-xs text-gray-600">
            <p><strong>Admin:</strong> admin@sportshoes.com / Admin123!</p>
            <p><strong>Gestor:</strong> gestion@sportshoes.com / Admin123!</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-primary-600 hover:text-primary-500">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}