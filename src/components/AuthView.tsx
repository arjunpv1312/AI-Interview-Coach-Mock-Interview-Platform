import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

export function AuthView({ onLogin }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simulate DB with localStorage
    const usersDB = JSON.parse(localStorage.getItem('usersDB') || '{}');
    
    if (isLogin) {
      if (usersDB[email]) {
        if (usersDB[email].password === password) {
          const userObj = usersDB[email].user;
          onLogin(userObj);
          return;
        } else {
          setError('Incorrect password');
          return;
        }
      } else {
        setError('Account not found with this email');
        return;
      }
    } else {
      // Register
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (usersDB[email]) {
        setError('Account already exists. Please login instead.');
        return;
      }
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: email,
        fullName: fullName || 'New User',
        joinDate: new Date().toISOString(),
        totalInterviews: 0,
        averageScore: 0
      };
      
      usersDB[email] = {
        password: password,
        user: newUser
      };
      
      localStorage.setItem('usersDB', JSON.stringify(usersDB));
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700/50 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20 text-white font-bold text-2xl border border-slate-700 overflow-hidden">
             <img src="/src/assets/images/interview_copilot_logo_v2_1779985371209.png" alt="Interview Copilot" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Interview Copilot</h1>
          <p className="text-slate-400 mt-2 text-center text-sm">
            {isLogin ? 'Sign in to track your interview performance.' : 'Create an account to start practicing.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                {isLogin && (
                    <button 
                        type="button" 
                        onClick={() => {
                            if (!email) {
                                setError('Please enter your email to reset password');
                            } else {
                                setError(`Password reset instructions sent to ${email}`);
                            }
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Forgot password?
                    </button>
                )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Repeat Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-6 shadow-lg shadow-blue-500/20"
          >
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
                setConfirmPassword('');
            }}
            className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
