import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase/config';
import { LogOut, BookOpen, Bell, User, Home, BookMarked, Send, XCircle, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminBypass');
    auth.signOut();
    window.location.href = '/login';
  };

  const navItems = userData?.role === 'admin' ? [
    { label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { label: 'Manage Books', icon: BookOpen, path: '/admin/books' },
    { label: 'Issue Book', icon: Send, path: '/admin/issue-book' },
    { label: 'Students', icon: User, path: '/admin/students' },
    { label: 'Borrow Requests', icon: BookMarked, path: '/admin/requests' },
    { label: 'Rejected Requests', icon: XCircle, path: '/admin/rejected-requests' },
    { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  ] : [
    { label: 'Dashboard', icon: Home, path: '/student/dashboard' },
    { label: 'Browse Books', icon: BookOpen, path: '/student/books' },
    { label: 'My Borrowings', icon: BookMarked, path: '/student/borrowings' },
    { label: 'My Profile', icon: User, path: '/student/profile' },
    { label: 'Notifications', icon: Bell, path: '/student/notifications' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col p-6 shrink-0 z-50 
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-foreground leading-none">LIBRARY</h1>
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-1 opacity-50">Management</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-muted-foreground hover:bg-secondary rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-muted-foreground hover:bg-secondary rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-semibold text-foreground text-lg hidden sm:block">
              {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-card"></span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                {userData?.name?.charAt(0) || userData?.email?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-medium text-foreground leading-tight">{userData?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{userData?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
