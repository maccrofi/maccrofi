// Profile page – shows user info from Firestore, with logout button.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, isConfigured } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

let doc, getDoc;
if (isConfigured) {
  ({ doc, getDoc } = await import('firebase/firestore'));
}

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      if (!isConfigured || !currentUser) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          setProfile(snap.data());
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [currentUser]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="page profile-page">
      <h2>My Profile</h2>
      {profile ? (
        <div className="profile-card">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
        </div>
      ) : (
        <p>Profile data not found.</p>
      )}
      <button onClick={handleLogout} className="btn btn-secondary">
        Log Out
      </button>
    </div>
  );
}
