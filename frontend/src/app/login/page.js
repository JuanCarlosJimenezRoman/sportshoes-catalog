'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data) => {
    await login(data.email, data.password);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
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
                id="email"
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
                  id="password"
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
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Iniciar sesión'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-500 font-medium">
              Regístrate
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Credenciales de prueba:
          </p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>Admin: admin@sportshoes.com / Admin123!</p>
            <p>Gestor: gestion@sportshoes.com / Admin123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}