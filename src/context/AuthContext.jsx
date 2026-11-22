// AuthContext – provides auth state and methods to the entire app.
// Works gracefully even when Firebase is not yet configured.
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, isConfigured } from '../firebase/config';

let createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup;

let doc, setDoc, serverTimestamp, getDoc;

// Only import Firebase modules if configured.
if (isConfigured) {
  ({
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
  } = await import('firebase/auth'));

  ({ doc, setDoc, serverTimestamp, getDoc } = await import('firebase/firestore'));
}

const AuthContext = createContext();

// Custom hook to consume auth context.
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(isConfigured); // skip loading if not configured

  // Sign up with email/password and create a Firestore user profile.
  async function signup(email, password, name) {
    if (!isConfigured) throw { code: 'auth/not-configured' };
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      name,
      email,
      role: 'customer',
      createdAt: serverTimestamp(),
    });
    return cred;
  }

  // Log in with email/password.
  function login(email, password) {
    if (!isConfigured) throw { code: 'auth/not-configured' };
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Log in with Google popup; creates Firestore profile on first login.
  async function loginWithGoogle() {
    if (!isConfigured) throw { code: 'auth/not-configured' };
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: cred.user.displayName || '',
        email: cred.user.email,
        role: 'customer',
        createdAt: serverTimestamp(),
      });
    }
    return cred;
  }

  // Log out.
  function logout() {
    if (!isConfigured) throw { code: 'auth/not-configured' };
    return signOut(auth);
  }

  // Send password-reset email.
  function resetPassword(email) {
    if (!isConfigured) throw { code: 'auth/not-configured' };
    return sendPasswordResetEmail(auth, email);
  }

  // Listen for auth state changes (only if Firebase is configured).
  useEffect(() => {
    if (!isConfigured) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    isConfigured,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
