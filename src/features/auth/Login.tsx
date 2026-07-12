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
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F7FBFF] font-sans overflow-hidden">
      
      {/* Left side illustration */}
      <div className="hidden lg:flex w-1/2 h-full items-center justify-center relative">
        <div className="w-[467px] h-[344px] relative flex items-center justify-center">
          {/* Custom SVG Illustration for Test Tube Man */}
          <svg width="467" height="344" viewBox="0 0 467 344" fill="none" xmlns="http://www.w3.org/2000/svg">
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

            {/* Mascot Body */}
            <rect x="175" y="100" width="50" height="150" fill="white" stroke="#6B7280" strokeWidth="2" />
            <rect x="165" y="90" width="70" height="10" fill="#BFDBFE" />
            <rect x="165" y="250" width="70" height="10" fill="#BFDBFE" />
            
            <path d="M175 190 L225 190" stroke="#6B7280" strokeWidth="1.5" strokeDasharray="4 2" />
            <path d="M175 220 L225 220" stroke="#6B7280" strokeWidth="1.5" />

            {/* Face */}
            <circle cx="190" cy="130" r="3" fill="#111827" />
            <circle cx="210" cy="130" r="3" fill="#111827" />
            <path d="M197 135 Q200 138 203 135" stroke="#111827" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Arms */}
            <path d="M185 150 C 160 180, 190 200, 195 200" stroke="#6B7280" strokeWidth="2" fill="none" />
            <path d="M215 150 C 250 170, 270 210, 250 220 C 230 230, 220 200, 220 200" stroke="#6B7280" strokeWidth="2" fill="none" />

            {/* Hands */}
            <circle cx="220" cy="202" r="5" fill="white" stroke="#6B7280" strokeWidth="1.5" />
            <circle cx="230" cy="204" r="5" fill="white" stroke="#6B7280" strokeWidth="1.5" />
            <circle cx="240" cy="206" r="5" fill="white" stroke="#6B7280" strokeWidth="1.5" />

            {/* Laptop */}
            <path d="M90 140 L160 140 L180 205 L60 205 Z" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
            <path d="M95 145 L155 145 L170 195 L75 195 Z" fill="white" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Right side login form */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-[20px]">
        <div className="w-[710px] h-[988px] bg-white border-[0.5px] border-[#60A5FA] rounded-[8px] flex flex-col items-center justify-center px-[100px] py-[250px] box-border">
          
          <div className="w-[510px] flex flex-col gap-[30px]">
            
            {/* Header Section */}
            <div className="flex flex-col gap-[30px]">
              {/* Logo */}
              <div className="w-[134.74px] h-[33.04px] flex items-center">
                <div className="flex items-center text-[#1B5DEF] font-extrabold text-[28px] tracking-tight">
                  <span className="relative z-10 text-[#000A3A]">P</span>
                  <span className="relative z-10 text-[#1B5DEF]">r</span>
                  <span className="relative z-10 text-[#1B5DEF]">e</span>
                  <span className="relative z-10 text-[#1B5DEF]">p</span>
                  <div className="flex -mx-1 mt-1 z-0 relative overflow-hidden h-[18px] w-[35px] bg-[#000A3A] rounded-sm transform skew-x-[0deg] items-center justify-between px-[2px]">
                    <div className="w-[2px] h-[4px] bg-white rounded-full"></div>
                    <div className="w-[2px] h-[4px] bg-white rounded-full"></div>
                    <div className="w-[2px] h-[4px] bg-white rounded-full"></div>
                    <div className="w-[2px] h-[4px] bg-white rounded-full"></div>
                  </div>
                  <span className="relative z-10 text-[#1B5DEF]">o</span>
                  <span className="relative z-10 text-[#1B5DEF]">u</span>
                  <span className="relative z-10 text-[#1B5DEF]">t</span>
                  <span className="relative z-10 text-[#1B5DEF]">e</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col gap-[20px]">
                <h1 className="text-[20px] font-semibold text-[#374151] leading-[150%] h-[30px] m-0">Login</h1>
                <p className="text-[12px] font-normal text-[#374151] leading-[150%] h-[18px] m-0">
                  Use your company provided Login credentials
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[30px]">
              
              {/* User ID Field */}
              <div className="flex flex-col gap-[15px]">
                <label className="text-[16px] font-medium text-[#374151] leading-[150%] h-[24px]">User ID</label>
                <div className={`w-[510px] h-[48px] bg-white border-[0.5px] rounded-[8px] flex items-center px-[16px] py-0 gap-[8px] box-border ${errors.username ? 'border-red-500' : 'border-[#9CA3AF]'}`}>
                  <input
                    type="text"
                    {...register("username", { required: "User ID is required" })}
                    className="w-full h-full outline-none bg-transparent text-[16px] font-medium text-[#374151] placeholder:text-[#D1D5DB]"
                    placeholder="Enter User ID"
                  />
                </div>
                {errors.username && <span className="text-red-500 text-[12px]">{(errors.username as any).message}</span>}
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-[15px]">
                <label className="text-[16px] font-medium text-[#374151] leading-[150%] h-[24px]">Password</label>
                <div className={`w-[510px] h-[48px] bg-white border-[0.5px] rounded-[8px] flex items-center px-[16px] py-0 gap-[8px] box-border ${errors.password ? 'border-red-500' : 'border-[#9CA3AF]'}`}>
                  <input
                    type="password"
                    {...register("password", { required: "Password is required" })}
                    className="w-full h-full outline-none bg-transparent text-[16px] font-medium text-[#374151] placeholder:text-[#D1D5DB]"
                    placeholder="Enter Password"
                  />
                </div>
                {errors.password && <span className="text-red-500 text-[12px]">{(errors.password as any).message}</span>}
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-[8px] border border-red-100 w-[510px]">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-[30px]">
                <a href="#" className="text-[14px] font-normal text-[#1B5DEF] leading-[150%] h-[21px] hover:underline cursor-pointer">
                  Forgot password?
                </a>
                
                <button 
                  type="submit" 
                  className="w-[510px] h-[48px] bg-[#5988EF] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  <span className="text-[16px] font-medium text-[#FAFAFA] leading-[150%]">Login</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};
