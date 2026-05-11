import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { BookMarked, Calendar, Search } from 'lucide-react';
import { Layout } from '../components/Layout';

export const StudentBorrowings: React.FC = () => {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowings = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'borrowRecords'), where('studentUid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const records: any[] = [];
        querySnapshot.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by date (newest first)
        records.sort((a, b) => {
          if (!a.borrowDate || !b.borrowDate) return 0;
          return b.borrowDate.seconds - a.borrowDate.seconds;
        });
        
        setBorrowings(records);
      } catch (error) {
        console.error("Error fetching borrowings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBorrowings();
  }, [user]);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Borrowings</h1>
        <p className="text-muted-foreground mt-1">Track your borrowed books and their due dates.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search your records..." 
              className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : borrowings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Book Details</th>
                  <th className="px-6 py-4 font-medium">Borrow Date</th>
                  <th className="px-6 py-4 font-medium">Due Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {borrowings.map((record) => (
                  <tr key={record.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-secondary rounded flex items-center justify-center">
                          <BookMarked className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{record.bookTitle}</p>
                          <p className="text-xs text-muted-foreground">ID: {record.bookId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {record.borrowDate?.toDate().toLocaleDateString() || record.requestDate?.toDate().toLocaleDateString() || 'Pending'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 ${
                        (record.status === 'approved' || record.status === 'issued') && record.dueDate && new Date() > record.dueDate.toDate() 
                          ? 'text-red-500 font-medium' 
                          : 'text-muted-foreground'
                      }`}>
                        <Calendar className="w-4 h-4" />
                        {record.dueDate?.toDate().toLocaleDateString() || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
                        record.status === 'issued' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        record.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        record.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        record.status === 'returned' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {record.status === 'issued' ? 'GIVEN' : record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
              <BookMarked className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No Borrowings Yet</h3>
            <p>You haven't borrowed any books from the library.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};
