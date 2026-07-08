import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data: Record<string, any>) => {
    try {
      setError('');
      const response = await api.post('/auth/login', {
        userId: data.username,
        password: data.password,
      });
      const token = response.data.token || response.data.jwt;
      if (token) {
        localStorage.setItem('token', token);
        navigate('/');
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err: any) {
      // In case of error (or if the API isn't up, we can use the hardcoded check for dev purposes if requested, but instructions say "Integrate the POST /auth/login endpoint... Hardcoded test credentials for verification". We should send them to the API)
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left side graphic (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand items-center justify-center p-12 relative overflow-hidden">
        {/* Aesthetic background circles */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-dark/20 rounded-full blur-3xl"></div>
        
        <div className="text-white text-center z-10 max-w-md">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Welcome to Preproute</h1>
          <p className="text-brand-light text-lg mb-8">
            Manage your tests, track student progress, and organize educational content seamlessly.
          </p>
          {/* Aesthetic CSS representation of a laptop/mascot */}
          <div className="w-64 h-48 mx-auto bg-white/20 rounded-xl border-4 border-white/30 backdrop-blur-sm p-4 relative shadow-2xl">
            <div className="w-full h-full bg-brand-dark/40 rounded-lg animate-pulse flex items-center justify-center">
                <span className="text-white/50 font-medium">Dashboard Preview</span>
            </div>
            <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 w-48 h-4 bg-white/30 rounded-b-xl shadow-lg"></div>
          </div>
        </div>
      </div>

      {/* Right side login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary mb-2">Login</h2>
            <p className="text-gray-500">Sign in to your Preproute account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">User ID / Username</label>
              <input
                type="text"
                {...register("username", { required: "Username is required" })}
                className={`input-field ${errors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="vedant-admin"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{(errors.username as any).message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Password</label>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className={`input-field ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{(errors.password as any).message}</p>}
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3 mt-4 text-lg">
              Sign In
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            For testing use <span className="font-semibold text-secondary">vedant-admin</span> / <span className="font-semibold text-secondary">vedant123</span>
          </div>
        </div>
      </div>
    </div>
  );
};
