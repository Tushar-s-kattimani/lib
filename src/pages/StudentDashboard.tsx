import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, BookMarked, Clock, CheckCircle } from 'lucide-react';
import { Layout } from '../components/Layout';

export const StudentDashboard: React.FC = () => {
  const { user, userData } = useAuth();
  const [stats, setStats] = useState({ active: 0, returned: 0, pending: 0 });
  const [recentBooks, setRecentBooks] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'borrowRecords'), where('studentUid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        let active = 0, returned = 0, pending = 0;
        const books: any[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          books.push({ id: doc.id, ...data });
          if (data.status === 'approved' || data.status === 'borrowed') active++;
          else if (data.status === 'returned') returned++;
          else if (data.status === 'pending') pending++;
        });
        
        setStats({ active, returned, pending });
        setRecentBooks(books.slice(0, 5)); // Just take first 5 for now
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    
    fetchStats();
  }, [user]);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {userData?.name}!</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your library activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Currently Borrowed</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.active}</h3>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Pending Requests</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.pending}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Books Returned</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.returned}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        </div>
        <div className="p-0">
          {recentBooks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Book Title</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Due Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentBooks.map((record) => (
                    <tr key={record.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{record.bookTitle}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {record.borrowDate?.toDate().toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {record.dueDate?.toDate().toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          record.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                          record.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                          record.status === 'returned' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <BookMarked className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No recent borrowing activity found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
