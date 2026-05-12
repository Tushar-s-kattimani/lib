import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  loginAsAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  loginAsAdmin: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Check for admin bypass first
      const bypassAdmin = localStorage.getItem('adminBypass');
      if (bypassAdmin === 'true') {
        setUser({ uid: 'admin-bypass', email: 'admin@system.local', emailVerified: true } as User);
        setUserData({ role: 'admin', name: 'System Administrator' });
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        // First check: Is this the specific hardcoded admin email?
        if (firebaseUser.email === 'klelibrary@admin.com') {
          setUserData({ role: 'admin', name: 'KLE Library Admin' });
          setLoading(false);
          return;
        }

        // Second check: Real Admin Docs (if any exist)
        const adminRef = doc(db, 'admins', firebaseUser.uid);
        const adminDoc = await getDoc(adminRef);
        
        if (adminDoc.exists()) {
          unsubscribeSnapshot = onSnapshot(adminRef, (doc) => {
            if (doc.exists()) setUserData(doc.data());
          });
          setLoading(false);
        } else {
          // Student logic - Fast path
          const studentRef = doc(db, 'students', firebaseUser.uid);
          unsubscribeSnapshot = onSnapshot(studentRef, (doc) => {
            if (doc.exists()) {
              setUserData(doc.data());
            } else {
              setUserData(null);
            }
            setLoading(false);
          });
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const loginAsAdmin = async () => {
    // Clear any existing firebase session first to avoid conflicts
    await auth.signOut();
    localStorage.setItem('adminBypass', 'true');
    setUser({ uid: 'admin-bypass', email: 'admin@system.local', emailVerified: true } as User);
    setUserData({ role: 'admin', name: 'System Administrator' });
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, loginAsAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
