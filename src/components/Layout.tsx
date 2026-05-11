import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase/config';
import { LogOut, BookOpen, Bell, Search, User, Home, BookMarked, Send } from 'lucide-react';

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
    { label: 'Dashboard', icon: Home, path: '/admin' },
    { label: 'Manage Books', icon: BookOpen, path: '/admin/books' },
    { label: 'Issue Book', icon: Send, path: '/admin/issue-book' },
    { label: 'Students', icon: User, path: '/admin/students' },
    { label: 'Borrow Requests', icon: BookMarked, path: '/admin/requests' },
    { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  ] : [
    { label: 'Dashboard', icon: Home, path: '/student' },
    { label: 'Browse Books', icon: Search, path: '/student/books' },
    { label: 'My Borrowings', icon: BookMarked, path: '/student/borrowings' },
    { label: 'Notifications', icon: Bell, path: '/student/notifications' },
    { label: 'Profile', icon: User, path: '/student/profile' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border p-4 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">LMS Portal</h1>
            <p className="text-xs text-muted-foreground capitalize">{userData?.role} Panel</p>
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
                <p className="font-medium text-foreground">{userData?.name || 'Admin User'}</p>
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
