import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Layout } from '../components/Layout';
import { BookMarked, Check, X, Clock, User, BookOpen, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSem, setSelectedSem] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [returnDates, setReturnDates] = useState<Record<string, string>>({});

  const semesters = ['All', '1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];

  const fetchRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'borrowRecords'));
      const requestsData: any[] = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      
      requestsData.sort((a, b) => {
        if (!a.requestDate || !b.requestDate) return 0;
        return b.requestDate.seconds - a.requestDate.seconds;
      });

      // De-duplicate: Keep only the most recent request for each student-book combination
      const uniqueRequests: any[] = [];
      const seen = new Set();
      
      requestsData.forEach(req => {
        const key = `${req.studentId}-${req.bookId}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueRequests.push(req);
        }
      });
      
      setRequests(uniqueRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId: string, bookId: string, status: 'approved' | 'rejected' | 'issued' | 'returned', customDate?: string) => {
    try {
      const updateData: any = {
        status,
        processedAt: serverTimestamp(),
      };

      if (status === 'approved') {
        updateData.approvedAt = serverTimestamp();
        updateData.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      }

      if (status === 'issued') {
        updateData.issuedAt = serverTimestamp();
      }

      if (status === 'returned') {
        updateData.returnedAt = customDate ? new Date(customDate) : new Date();
      }

      // Stock Management
      const currentReq = requests.find(r => r.id === requestId);
      
      // Decrement stock only on FIRST approval
      if (status === 'approved' && currentReq?.status === 'pending') {
        await updateDoc(doc(db, 'books', bookId), {
          available: increment(-1)
        });
      }

      // Increment stock on return
      if (status === 'returned' && currentReq?.status === 'issued') {
        await updateDoc(doc(db, 'books', bookId), {
          available: increment(1)
        });
      }

      await updateDoc(doc(db, 'borrowRecords', requestId), updateData);
      toast.success(`Request ${status === 'issued' ? 'marked as received' : status === 'returned' ? 'marked as returned' : status} successfully!`);
      fetchRequests();
    } catch (error: any) {
      toast.error("Action failed: " + error.message);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSemFilter = selectedSem === 'All' || 
                            req.studentSemester === selectedSem ||
                            (selectedSem !== 'All' && req.studentSemester?.startsWith(selectedSem.charAt(0)));

    const matchesStatusFilter = selectedStatus === 'All' || 
                               (selectedStatus === 'Pending' && req.status === 'pending') ||
                               (selectedStatus === 'Book Not Received' && req.status === 'approved') ||
                               (selectedStatus === 'Book Received' && req.status === 'issued') ||
                               (selectedStatus === 'Returned' && req.status === 'returned');

    return matchesSemFilter && matchesStatusFilter && req.status !== 'rejected';
  });

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Borrow Requests</h1>
          <p className="text-muted-foreground mt-1">Review and manage book borrowing requests from students.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Semester</label>
            <select 
              value={selectedSem} 
              onChange={(e) => setSelectedSem(e.target.value)}
              className="bg-card border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none min-w-[140px]"
            >
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-card border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none min-w-[160px]"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Book Not Received">Book Not Received</option>
              <option value="Book Received">Book Received</option>
              <option value="Returned">Returned</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium text-center">Semester</th>
                  <th className="px-6 py-4 font-medium">Book Details</th>
                  <th className="px-6 py-4 font-medium">Dates</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {request.studentName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{request.studentName}</p>
                          <p className="text-[10px] text-muted-foreground opacity-60">{request.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary rounded-full border border-primary/10 text-xs font-bold whitespace-nowrap">
                        {request.studentSemester || 'N/A'}
                      </span>
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
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-medium">
                          <Clock className="w-3 h-3" />
                          Req: {request.requestDate?.toDate().toLocaleDateString() || 'N/A'}
                        </div>
                        {request.dueDate && (
                          <div className={`flex items-center gap-2 text-[10px] font-bold ${request.status === 'returned' ? 'text-green-500' : 'text-amber-500'}`}>
                            <Clock className="w-3 h-3" />
                            {request.status === 'returned' ? 'Ret: ' : 'Due: '}
                            {request.status === 'returned' 
                              ? request.returnedAt?.toDate().toLocaleDateString() 
                              : (request.dueDate instanceof Date ? request.dueDate.toLocaleDateString() : request.dueDate.toDate().toLocaleDateString())}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        request.status === 'issued' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        request.status === 'approved' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        request.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        request.status === 'returned' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                        {request.status === 'issued' ? 'BOOK RECEIVED' : 
                         request.status === 'approved' ? 'BOOK NOT RECEIVED' : 
                         request.status === 'returned' ? 'RETURNED' : 
                         request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {request.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleAction(request.id, request.bookId, 'approved')}
                              className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-all active:scale-90"
                              title="Approve"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleAction(request.id, request.bookId, 'rejected')}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-90"
                              title="Reject"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {request.status !== 'pending' && request.status !== 'rejected' && (
                          <div className="flex items-center gap-2">
                            {request.status === 'issued' && (
                              <input 
                                type="date" 
                                className="text-[10px] bg-secondary border border-border rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                                value={returnDates[request.id] || new Date().toISOString().split('T')[0]}
                                onChange={(e) => setReturnDates(prev => ({ ...prev, [request.id]: e.target.value }))}
                              />
                            )}
                            <select 
                              value={request.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as any;
                                if (newStatus === 'returned') {
                                  handleAction(request.id, request.bookId, 'returned', returnDates[request.id]);
                                } else {
                                  handleAction(request.id, request.bookId, newStatus);
                                }
                              }}
                              className="text-[10px] font-bold bg-secondary border border-border rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="approved">Book Not Received</option>
                              <option value="issued">Book Received</option>
                              <option value="returned">Returned</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <BookMarked className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No Requests Found</h3>
            <p>No borrowing requests for the selected semester.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};
