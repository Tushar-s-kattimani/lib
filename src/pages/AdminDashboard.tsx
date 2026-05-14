import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ students: 0, books: 0, pendingRequests: 0, activeBorrows: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const studentsSnap = await getDocs(collection(db, 'students'));
        const booksSnap = await getDocs(collection(db, 'books'));
        const borrowSnap = await getDocs(collection(db, 'borrowRecords'));

        let pendingRequests = 0;
        let activeBorrows = 0;
        let totalAvailableBooks = 0;

        borrowSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'pending') pendingRequests++;
          if (data.status === 'approved' || data.status === 'issued') activeBorrows++;
        });

        booksSnap.forEach((doc) => {
          const data = doc.data();
          totalAvailableBooks += (data.available || 0);
        });

        setStats({
          students: studentsSnap.size,
          books: totalAvailableBooks,
          pendingRequests,
          activeBorrows
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Total Students</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.students}</h3>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Total Available Books</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.books}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Pending Requests</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.pendingRequests}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Active Borrows</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.activeBorrows}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/admin/books')} className="p-4 border border-border rounded-xl hover:bg-secondary transition-colors text-left">
              <BookOpen className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-medium text-foreground">Add New Book</h4>
              <p className="text-xs text-muted-foreground mt-1">Add to library catalog</p>
            </button>
            <button onClick={() => navigate('/admin/students')} className="p-4 border border-border rounded-xl hover:bg-secondary transition-colors text-left">
              <Users className="w-6 h-6 text-purple-500 mb-2" />
              <h4 className="font-medium text-foreground">Manage Students</h4>
              <p className="text-xs text-muted-foreground mt-1">View registered students</p>
            </button>
            <button onClick={() => navigate('/admin/requests')} className="p-4 border border-border rounded-xl hover:bg-secondary transition-colors text-left">
              <Clock className="w-6 h-6 text-amber-500 mb-2" />
              <h4 className="font-medium text-foreground">Review Requests</h4>
              <p className="text-xs text-muted-foreground mt-1">Approve/Reject borrows</p>
            </button>
            <button onClick={() => navigate('/admin/notifications')} className="p-4 border border-border rounded-xl hover:bg-secondary transition-colors text-left">
              <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
              <h4 className="font-medium text-foreground">Send Notification</h4>
              <p className="text-xs text-muted-foreground mt-1">Message to students</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
