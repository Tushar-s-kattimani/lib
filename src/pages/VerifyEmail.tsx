import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { auth } from '../firebase/config';
import { sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';

export const VerifyEmail: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerification = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(checkVerification);
          navigate('/student');
        }
      }
    }, 3000);

    return () => clearInterval(checkVerification);
  }, [navigate]);

  const handleResend = async () => {
    if (auth.currentUser) {
      setLoading(true);
      try {
        await sendEmailVerification(auth.currentUser);
        toast.success('Verification email resent!');
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
          <Mail className="w-10 h-10 text-blue-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Verify Your Email</h2>
        <p className="text-slate-300 mb-8">
          We've sent an email to <span className="text-white font-medium">{auth.currentUser?.email}</span>. 
          Please verify your email before logging in.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Resend Verification Email
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border border-white/10"
          >
            <LogOut className="w-5 h-5" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
