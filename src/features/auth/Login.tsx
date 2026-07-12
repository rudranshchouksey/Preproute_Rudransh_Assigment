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
      const token = response.data?.data?.token || response.data?.token || response.data?.jwt;
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
    <div className="flex min-h-screen w-full bg-white font-sans">
      {/* Left side graphic (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#FAFCFF] items-center justify-center p-12 relative border-r border-gray-100">
        <div className="relative w-[500px] h-[500px] flex items-center justify-center">
          {/* Custom SVG Illustration trying to match the mascot */}
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sparkles */}
            <path d="M70 150 L75 145 L80 150 L75 155 Z" fill="#A0AABF" />
            <path d="M75 135 L76 142 M75 165 L76 158 M60 150 L67 150 M90 150 L83 150" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
            
            <circle cx="280" cy="140" r="4" stroke="#6B7280" strokeWidth="2" fill="none" />
            
            <path d="M340 180 L345 175 L350 180 L345 185 Z" fill="#A0AABF" />
            <path d="M345 170 L346 174 M345 190 L346 186 M335 180 L339 180 M355 180 L351 180" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />

            {/* Desk */}
            <path d="M30 210 L370 210" stroke="#6B7280" strokeWidth="8" strokeLinecap="round" />
            {/* Desk Legs */}
            <line x1="60" y1="214" x2="60" y2="300" stroke="#9CA3AF" strokeWidth="2" />
            <line x1="140" y1="214" x2="140" y2="300" stroke="#9CA3AF" strokeWidth="2" />
            <line x1="260" y1="214" x2="260" y2="300" stroke="#9CA3AF" strokeWidth="2" />
            <line x1="340" y1="214" x2="340" y2="300" stroke="#9CA3AF" strokeWidth="2" />

            {/* Mascot Body (Vertical Pipe) */}
            <rect x="175" y="100" width="50" height="150" fill="white" stroke="#6B7280" strokeWidth="2" />
            <rect x="165" y="90" width="70" height="10" fill="#E0F2FE" />
            <rect x="165" y="250" width="70" height="10" fill="#E0F2FE" />
            {/* Pipe creases */}
            <path d="M175 190 L225 190" stroke="#6B7280" strokeWidth="1.5" strokeDasharray="4 2" />
            <path d="M175 220 L225 220" stroke="#6B7280" strokeWidth="1.5" />

            {/* Face */}
            <circle cx="190" cy="130" r="3" fill="#111827" />
            <circle cx="210" cy="130" r="3" fill="#111827" />
            <path d="M197 135 Q200 138 203 135" stroke="#111827" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Arms */}
            <path d="M185 150 C 160 180, 190 200, 195 200" stroke="#6B7280" strokeWidth="2" fill="none" />
            <path d="M215 150 C 250 170, 270 210, 250 220 C 230 230, 220 200, 220 200" stroke="#6B7280" strokeWidth="2" fill="none" />

            {/* Hands typing */}
            <circle cx="220" cy="202" r="5" fill="white" stroke="#6B7280" strokeWidth="1.5" />
            <circle cx="230" cy="204" r="5" fill="white" stroke="#6B7280" strokeWidth="1.5" />
            <circle cx="240" cy="206" r="5" fill="white" stroke="#6B7280" strokeWidth="1.5" />

            {/* Laptop */}
            <path d="M90 140 L160 140 L180 205 L60 205 Z" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
            {/* Laptop Screen glow */}
            <path d="M95 145 L155 145 L170 195 L75 195 Z" fill="white" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Right side login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="mb-10 flex items-center">
            {/* Preproute Text Logo matching Figma */}
            <div className="flex items-center text-[#3B82F6] font-extrabold text-3xl tracking-tight">
              <span className="relative z-10">P</span>
              <span className="relative z-10">r</span>
              <span className="relative z-10">e</span>
              <span className="relative z-10">p</span>
              <div className="flex -mx-1 mt-1 z-0 relative overflow-hidden h-4 w-12 bg-[#111827] rounded-sm transform skew-x-[-15deg] flex items-center justify-between px-1">
                <div className="w-1 h-2 bg-white rounded-full"></div>
                <div className="w-1 h-2 bg-white rounded-full"></div>
                <div className="w-1 h-2 bg-white rounded-full"></div>
                <div className="w-1 h-2 bg-white rounded-full"></div>
              </div>
              <span className="relative z-10">o</span>
              <span className="relative z-10">u</span>
              <span className="relative z-10">t</span>
              <span className="relative z-10">e</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login</h2>
            <p className="text-sm text-gray-500 font-medium">Use your company provided Login credentials</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">User ID</label>
              <input
                type="text"
                {...register("username", { required: "User ID is required" })}
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6]'} outline-none transition-colors text-sm placeholder:text-gray-400`}
                placeholder="Enter User ID"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1.5">{(errors.username as any).message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6]'} outline-none transition-colors text-sm placeholder:text-gray-400`}
                placeholder="Enter Password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{(errors.password as any).message}</p>}
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <a href="#" className="text-sm text-[#3B82F6] hover:underline font-medium inline-block mb-4">
                Forgot password?
              </a>
              <button type="submit" className="w-full py-3 bg-[#5984F7] hover:bg-blue-600 text-white rounded-lg font-semibold text-base transition-colors shadow-sm">
                Login
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-xs text-gray-400">
            For testing use <span className="font-semibold text-gray-600">vedant-admin</span> / <span className="font-semibold text-gray-600">vedant123</span>
          </div>
        </div>
      </div>
    </div>
  );
};
