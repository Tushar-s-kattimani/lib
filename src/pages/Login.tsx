import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Mail, Lock, UserCog, GraduationCap, ArrowRight } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAsAdmin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'admin') {
      if (email === 'klelibrary@admin.com' && password === 'kle@151571') {
        loginAsAdmin();
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      } else {
        toast.error('Invalid Admin Credentials. Please use the authorized admin email and password.');
      }
      return;
    }

=======
    if (role === 'student') {
      localStorage.removeItem('adminBypass');
    }

>>>>>>> b3946376a1afa3b22d1e39fb8768d174049160e3
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const studentDoc = await getDoc(doc(db, 'students', user.uid));
      if (studentDoc.exists()) {
        if (!user.emailVerified) {
          navigate('/verify-email');
        } else {
          toast.success('Login successful!');
          navigate('/student');
        }
      } else {
        auth.signOut();
        toast.error('Invalid student credentials.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
<<<<<<< HEAD
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-28 h-28 p-2 bg-white rounded-full shadow-2xl shadow-black/40 ring-4 ring-white/10 flex items-center justify-center overflow-hidden transform transition-all duration-500 hover:scale-110 hover:rotate-3">
                <img 
                  src="/images.png" 
                  alt="Library Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          <div className="text-center mb-4 space-y-1">
            <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400/90 mb-1">
              KLE Society's
            </h1>
            <p className="text-lg font-semibold text-white leading-tight">
              College of BCA and BBA, Gokak
            </p>
          </div>
          <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-center text-slate-300 mb-8 text-sm">Enter your credentials to access the library</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex gap-4 p-1 bg-black/20 rounded-2xl border border-white/10 backdrop-blur-sm mb-6">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 ${
                  role === 'student' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Student
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 ${
                  role === 'admin' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCog className="w-4 h-4" /> Admin
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-blue-400 transition-colors">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {role === 'student' ? (
            <p className="mt-8 text-center text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-blue-400 font-medium transition-colors">
                Register here
              </Link>
            </p>
          ) : (
            <div className="mt-8" />
          )}
        </div>
      </div>
    </div>
  );
};
