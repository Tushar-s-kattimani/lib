import React from 'react';
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
import { AdminRejectedRequests } from './pages/AdminRejectedRequests';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          
          <Route path="/student/*" element={
            <ProtectedRoute role="student">
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="books" element={<StudentBooks />} />
                <Route path="borrowings" element={<StudentBorrowings />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute role="admin">
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="issue-book" element={<AdminIssueBook />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="rejected-requests" element={<AdminRejectedRequests />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
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
