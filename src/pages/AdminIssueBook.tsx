import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, increment, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Layout } from '../components/Layout';
import { BookMarked, User, BookOpen, Send, AlertCircle, Hash, Mail, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminIssueBook: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    studentEmail: '',
    studentId: '',
    studentName: '',
    bookTitle: '',
    bookId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsSnap, booksSnap] = await Promise.all([
          getDocs(collection(db, 'students')),
          getDocs(collection(db, 'books'))
        ]);

        const studentsData = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const booksData = booksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setStudents(studentsData);
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load students or books");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentUid = e.target.value;
    if (!studentUid) return;
    
    const selected = students.find(s => s.id === studentUid);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        studentEmail: selected.email || '',
        studentId: selected.studentId || '',
        studentName: selected.name || ''
      }));
    }
  };

  const handleBookSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bookId = e.target.value;
    if (!bookId) return;
    
    const selected = books.find(b => b.id === bookId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        bookTitle: selected.title || '',
        bookId: selected.id || ''
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let studentUid = 'manual-entry';
      let studentName = formData.studentName;
      let studentSemester = '';

      const studentMatch = students.find(s => s.studentId === formData.studentId || s.email === formData.studentEmail);
      if (studentMatch) {
        studentUid = studentMatch.id;
        studentName = studentMatch.name;
        studentSemester = studentMatch.semester;
      }

      // Check if semester is missing
      if (!formData.studentId || (!studentSemester && !formData.studentName)) {
        return toast.error("Student must have a semester assigned before issuing a book.");
      }

      await addDoc(collection(db, 'borrowRecords'), {
        studentUid: studentUid,
        studentName: studentName || 'Walk-in Student',
        studentEmail: formData.studentEmail,
        studentId: formData.studentId,
        studentSemester: studentSemester || 'Manual Entry (No Sem)',
        bookId: formData.bookId,
        bookTitle: formData.bookTitle,
        status: 'approved',
        requestDate: serverTimestamp(),
        borrowDate: serverTimestamp(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        issuedBy: 'Admin (Direct)'
      });

      if (formData.bookId) {
        const bookRef = doc(db, 'books', formData.bookId);
        await updateDoc(bookRef, {
          available: increment(-1)
        });
      }

      toast.success(`Book "${formData.bookTitle}" issued successfully!`);
      setFormData({ studentEmail: '', studentId: '', studentName: '', bookTitle: '', bookId: '' });
    } catch (error: any) {
      console.error("Error issuing book:", error);
      toast.error("Failed to issue book: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Direct Issue Book</h1>
        <p className="text-muted-foreground mt-1">Quickly select from lists or manually type the details below.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" /> Quick Select
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Registered Student</label>
                <select 
                  onChange={handleStudentSelect}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none"
                >
                  <option value="">-- Select from List --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Library Book</label>
                <select 
                  onChange={handleBookSelect}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none"
                >
                  <option value="">-- Select from List --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title} ({b.available} left)</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-xs text-primary leading-relaxed">
                <AlertCircle className="w-4 h-4 inline mr-1 mb-0.5" />
                Selecting from these lists will automatically fill the form on the right. You can still edit the fields manually.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
            <form onSubmit={handleIssueBook} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Full Name
                  </label>
                  <input 
                    type="text" name="studentName" required value={formData.studentName} onChange={handleChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    placeholder="Student full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> Email Address
                  </label>
                  <input 
                    type="email" name="studentEmail" required value={formData.studentEmail} onChange={handleChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    placeholder="student@gmail.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" /> Student ID
                  </label>
                  <input 
                    type="text" name="studentId" required value={formData.studentId} onChange={handleChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    placeholder="STU-001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" /> Book Title
                  </label>
                  <input 
                    type="text" name="bookTitle" required value={formData.bookTitle} onChange={handleChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    placeholder="The Great Gatsby"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-primary" /> Book ID (Optional)
                </label>
                <input 
                  type="text" name="bookId" value={formData.bookId} onChange={handleChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  placeholder="Firestore Document ID (Auto-fills if you select from list)"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 active:scale-95"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Issue Book Successfully
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};
