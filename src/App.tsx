
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

import { AdminRegister } from './pages/AdminRegister';
import { StudentBorrowings } from './pages/StudentBorrowings';
import { StudentProfile } from './pages/StudentProfile';
import { StudentBooks } from './pages/StudentBooks';
import { StudentNotifications } from './pages/StudentNotifications';

import { AdminBooks } from './pages/AdminBooks';
import { AdminStudents } from './pages/AdminStudents';
import { AdminRequests } from './pages/AdminRequests';
import { AdminIssueBook } from './pages/AdminIssueBook';
import { AdminNotifications } from './pages/AdminNotifications';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Routes>
                <Route path="" element={<StudentDashboard />} />
                <Route path="books" element={<StudentBooks />} />
                <Route path="borrowings" element={<StudentBorrowings />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="notifications" element={<StudentNotifications />} />
                {/* Add other student routes here */}
              </Routes>
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Routes>
                <Route path="" element={<AdminDashboard />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="issue-book" element={<AdminIssueBook />} />
                <Route path="notifications" element={<AdminNotifications />} />
                {/* Add other admin routes here */}
              </Routes>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
