import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Layout } from '../components/Layout';
import { BookOpen, Search, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: 1,
    description: ''
  });

  const fetchBooks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'books'));
      const booksData: any[] = [];
      querySnapshot.forEach((doc) => {
        booksData.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort locally by title
      booksData.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      setBooks(booksData);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleOpenModal = (book?: any) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        category: book.category || '',
        quantity: book.quantity || 1,
        description: book.description || ''
      });
    } else {
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: 1,
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'quantity' ? parseInt(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const bookData = {
        ...formData,
        available: editingBook ? editingBook.available + (formData.quantity - editingBook.quantity) : formData.quantity,
        updatedAt: serverTimestamp()
      };

      if (editingBook) {
        // Update existing book
        await updateDoc(doc(db, 'books', editingBook.id), bookData);
        toast.success("Book updated successfully!");
      } else {
        // Add new book
        const bookRef = await addDoc(collection(db, 'books'), {
          ...bookData,
          createdAt: serverTimestamp()
        });

        // Create notification for students
        await addDoc(collection(db, 'notifications'), {
          type: 'new_book',
          title: 'New Book Alert!',
          message: `"${formData.title}" by ${formData.author} has just been added to the library.`,
          bookId: bookRef.id,
          createdAt: serverTimestamp()
        });

        toast.success("New book added successfully!");
      }
      
      handleCloseModal();
      fetchBooks(); // Refresh list
    } catch (error: any) {
      console.error("Error saving book:", error);
      toast.error(error.message || "Failed to save book");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'books', id));
        toast.success("Book deleted successfully!");
        setBooks(books.filter(b => b.id !== id));
      } catch (error) {
        console.error("Error deleting book:", error);
        toast.error("Failed to delete book");
      }
    }
  };

  const filteredBooks = books.filter(book => 
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn?.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Books</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or remove books from the library catalog.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Book</span>
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30 flex justify-between items-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by title, author, or ISBN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="hidden sm:flex text-sm text-muted-foreground">
            Total Books: <span className="font-bold text-foreground ml-1">{books.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Book Info</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium text-center">Quantity</th>
                  <th className="px-6 py-4 font-medium text-center">Available</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-secondary rounded flex items-center justify-center border border-border shrink-0">
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground line-clamp-1">{book.title}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <p className="text-xs text-muted-foreground">by {book.author}</p>
                            <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-muted-foreground rounded border border-border">ID: {book.id}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-wider">ISBN: {book.isbn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">
                        {book.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-foreground">
                      {book.quantity}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${book.available > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {book.available !== undefined ? book.available : book.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(book)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit Book"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(book.id, book.title)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              <BookOpen className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No Books Found</h3>
            <p>Your library catalog is empty or no books match your search.</p>
            <button 
              onClick={() => handleOpenModal()}
              className="mt-4 text-primary hover:underline font-medium"
            >
              Add your first book
            </button>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-foreground">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="bookForm" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Book Title</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="e.g. The Great Gatsby" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Author</label>
                    <input type="text" name="author" required value={formData.author} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="e.g. F. Scott Fitzgerald" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">ISBN</label>
                    <input type="text" name="isbn" required value={formData.isbn} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="e.g. 978-0743273565" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
                    <select name="category" required value={formData.category} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all">
                      <option value="" disabled>Select a category</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Science">Science</option>
                      <option value="History">History</option>
                      <option value="Technology">Technology</option>
                      <option value="Arts">Arts</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Total Quantity</label>
                    <input type="number" name="quantity" min="1" required value={formData.quantity} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                  <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none" placeholder="Brief summary of the book..."></textarea>
                </div>

                {editingBook && (
                  <div className="flex items-center gap-2 p-3 bg-blue-500/10 text-blue-500 rounded-lg text-sm border border-blue-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>Updating quantity will automatically adjust the available count based on current borrowed books.</p>
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-6 border-t border-border bg-secondary/30 flex justify-end gap-3 shrink-0 rounded-b-3xl">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-5 py-2.5 bg-background border border-border text-foreground hover:bg-secondary rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="bookForm"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  editingBook ? 'Save Changes' : 'Add Book'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
