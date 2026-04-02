import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { registerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Hexagon, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please complete all fields');
    if (password.length < 4) return toast.error('Password must be at least 4 characters');
    
    setIsLoading(true);
    try {
      const data = await registerApi({ email, password });
      login(data.access_token);
      toast.success('Registration successful!');
      navigate('/', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 font-sans px-4 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-slate-700 to-slate-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.4)] mb-4">
             <Hexagon className="text-white fill-white/10" size={32} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Workspace</h1>
          <p className="text-slate-400 text-sm mt-1">Start organizing your life with Task Flow</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="user@example.com"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all font-medium"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input 
              type="password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all font-medium"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {isLoading ? <Loader2 className="animate-spin text-slate-300" size={20} /> : (
              <>Sign Up <UserPlus size={18} className="text-slate-300 group-hover:scale-110 transition-transform"/></>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-8 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-slate-200 hover:text-white font-semibold transition-colors underline decoration-slate-600 underline-offset-4 pointer">
            Log in here
          </Link>
        </p>

      </div>
    </div>
  );
};
