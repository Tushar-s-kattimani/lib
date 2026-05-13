import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase/config';
import { LogOut, BookOpen, Bell, User, Home, BookMarked, Send, XCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col p-6 shrink-0 hidden lg:flex">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-foreground leading-none">LIBRARY</h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-1 opacity-50">Management</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
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
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
          <h2 className="font-semibold text-foreground text-lg">
            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-card"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {userData?.name?.charAt(0) || userData?.email?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-foreground">{userData?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{userData?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
