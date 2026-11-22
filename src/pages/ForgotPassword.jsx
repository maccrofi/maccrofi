// ForgotPassword page – sends a password-reset email.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword, isConfigured } = useAuth();

  function friendlyError(code) {
    switch (code) {
      case 'auth/not-configured':
        return 'Firebase is not configured yet. Add your keys to the .env file.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection.';
      default:
        return 'Failed to send reset email. Please try again.';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for a password reset link.');
    } catch (err) {
      setError(friendlyError(err.code));
    }
    setLoading(false);
  }

  return (
    <div className="page auth-page">
      <h2>Reset Password</h2>
      {!isConfigured && (
        <p className="error-msg">
          ⚠️ Firebase not configured. This won't work until you add keys to <code>.env</code>
        </p>
      )}
      {error && <p className="error-msg">{error}</p>}
      {message && <p className="success-msg">{message}</p>}
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
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
      <p className="auth-links">
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}
