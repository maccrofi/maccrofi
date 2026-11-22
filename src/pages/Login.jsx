// Login page – email/password and Google sign-in.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, isConfigured } = useAuth();
  const navigate = useNavigate();

  // Map Firebase error codes to friendly messages.
  function friendlyError(code) {
    switch (code) {
      case 'auth/not-configured':
        return 'Firebase is not configured yet. Add your keys to the .env file.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'Email or password is incorrect.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'Login failed. Please try again.';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/profile');
    } catch (err) {
      setError(friendlyError(err.code));
    }
    setLoading(false);
  }

  async function handleGoogle() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/profile');
    } catch (err) {
      setError(friendlyError(err.code));
    }
    setLoading(false);
  }

  return (
    <div className="page auth-page">
      <h2>Log In</h2>
      {!isConfigured && (
        <p className="error-msg">
          ⚠️ Firebase not configured. Auth won't work until you add keys to <code>.env</code>
        </p>
      )}
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>
      <button onClick={handleGoogle} className="btn btn-google" disabled={loading}>
        Sign in with Google
      </button>
      <p className="auth-links">
        <Link to="/forgot-password">Forgot password?</Link>
        {' · '}
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}
