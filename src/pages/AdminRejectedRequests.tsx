import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Layout } from '../components/Layout';
import { BookMarked, Trash2, Clock, BookOpen, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminRejectedRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRejectedRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'borrowRecords'));
      const rejectedData: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'rejected') {
          rejectedData.push({ id: doc.id, ...data });
        }
      });
      
      rejectedData.sort((a, b) => {
        if (!a.processedAt || !b.processedAt) return 0;
        return b.processedAt.seconds - a.processedAt.seconds;
      });

      // De-duplicate: Keep only the most recent rejected record for each student-book combination
      const uniqueRejected: any[] = [];
      const seen = new Set();
      
      rejectedData.forEach(req => {
        const key = `${req.studentId}-${req.bookId}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueRejected.push(req);
        }
      });
      
      setRequests(uniqueRejected);
    } catch (error) {
      console.error("Error fetching rejected requests:", error);
      toast.error("Failed to load rejected requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedRequests();
  }, []);

  const handleDelete = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this rejected record?")) return;
    
    try {
      await deleteDoc(doc(db, 'borrowRecords', requestId));
      toast.success("Record deleted successfully");
      fetchRejectedRequests();
    } catch (error: any) {
      toast.error("Delete failed: " + error.message);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Rejected Requests</h1>
        <p className="text-muted-foreground mt-1">History of borrowing requests that were declined.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Book Details</th>
                  <th className="px-6 py-4 font-medium">Rejected On</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold">
                          {request.studentName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{request.studentName}</p>
                          <p className="text-[10px] text-muted-foreground opacity-60">{request.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{request.bookTitle}</p>
                          <p className="text-[10px] text-muted-foreground opacity-60">ID: {request.bookId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {request.processedAt?.toDate().toLocaleDateString() || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-red-500/10 text-red-500 border-red-500/20">
                        REJECTED
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(request.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-90"
                        title="Delete Record"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No Rejected Requests</h3>
            <p>History of rejected requests will appear here.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};
