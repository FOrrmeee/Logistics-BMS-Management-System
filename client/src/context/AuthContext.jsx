import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from '../utils/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Try Firebase first
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const { data } = await api.post('/auth/firebase', { idToken });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (firebaseError) {
      console.warn('Firebase login failed, trying local database login...', firebaseError);
      try {
        // Fallback to local MongoDB login (takes username, not email)
        const { data } = await api.post('/auth/login', { username: email, password });
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
      } catch (localError) {
        throw new Error(localError.response?.data?.message || 'Invalid credentials');
      }
    }
  };

  const loginWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const idToken = await userCredential.user.getIdToken();
    const { data } = await api.post('/auth/firebase', { idToken });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error('Firebase signout error', e);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
