
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
