import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '../api/client';
import { useAuth } from '../features/auth/AuthContext';
import { registerSchema, type RegisterFormData } from '../features/auth/schemas';
import { User, Lock, Loader2, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'resident'
    }
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setApiError('');
    try {
      // 1. Register
      const res = await apiClient.post('/iam/auth/register', data);
      
      // 2. Login automatically with the received tokens
      if (res.data.accessToken && res.data.refreshToken) {
        await login(res.data.accessToken, res.data.refreshToken);
        navigate('/dashboard');
      } else {
        // Fallback if tokens aren't returned directly (though docs say they are)
        navigate('/login');
      }
    } catch (err: any) {
      setApiError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ABOS</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Create your account</p>
        </div>

        {apiError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <User className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", errors.email ? "text-red-400" : "text-gray-400")} />
              <input
                {...register('email')}
                type="email"
                className={cn(
                  "pl-10 w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2.5 pr-2.5 outline-none transition",
                  errors.email 
                    ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                    : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                )}
                placeholder="name@example.com"
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", errors.password ? "text-red-400" : "text-gray-400")} />
              <input
                {...register('password')}
                type="password"
                className={cn(
                  "pl-10 w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2.5 pr-2.5 outline-none transition",
                  errors.password
                    ? "border-red-500 focus:ring-2 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                )}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <div className="relative">
              <Briefcase className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", errors.role ? "text-red-400" : "text-gray-400")} />
              <select
                {...register('role')}
                className={cn(
                  "pl-10 w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2.5 pr-2.5 outline-none transition appearance-none",
                  errors.role
                    ? "border-red-500 focus:ring-2 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                )}
              >
                <option value="resident">Resident</option>
                <option value="building_admin">Building Admin</option>
                <option value="manager">Manager</option>
                <option value="provider">Provider</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            {errors.role && (
              <span className="text-xs text-red-500 mt-1 block">{errors.role.message}</span>
            )}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
