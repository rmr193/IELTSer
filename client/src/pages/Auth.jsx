import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  async function handleGoogleSuccess(credentialResponse) {
    if (!credentialResponse?.credential) {
      setError('No credential received from Google. Please try again.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function handleGoogleError() {
    setError('Google sign-in was cancelled or encountered an error.');
  }

  return (
    <div className="auth">
      <section className="auth-intro">
        <div className="brand brand-lg">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="brand-name">IELTS 90-Day Mastery Platform</span>
        </div>
        <h1>From foundations to Band 8.0+ in 90 days.</h1>
        <p>
          Six phases, 90 days and 449 structured study tasks across Listening, Reading,
          Writing, Speaking, vocabulary, and grammar. Track your progress every single day.
        </p>
        <ul className="auth-facts">
          <li>
            <strong>6</strong> phases
          </li>
          <li>
            <strong>90</strong> days
          </li>
          <li>
            <strong>449</strong> tasks
          </li>
        </ul>
      </section>

      <section className="auth-card">
        <div className="auth-box">
          <h2>Welcome</h2>
          <p className="muted" style={{ marginBottom: '1.75rem' }}>
            Sign in with your Google account to access your personal study roadmap and track daily tasks.
          </p>

          {error && (
            <div className="banner danger" role="alert" style={{ marginBottom: '1.25rem' }}>
              <span>{error}</span>
            </div>
          )}

          {!googleClientId ? (
            <div
              style={{
                background: '#fff8e6',
                border: '1px solid #ffd591',
                padding: '1rem 1.25rem',
                borderRadius: '10px',
                color: '#873800',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              <strong>Configuration Needed:</strong>
              <p style={{ marginTop: '0.35rem' }}>
                Please set <code>VITE_GOOGLE_CLIENT_ID</code> in your <code>client/.env</code> and in your Vercel Project Environment Variables.
              </p>
            </div>
          ) : (
            <div className="google-auth-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                size="large"
                shape="pill"
                text="continue_with"
              />
              {busy && <p className="muted text-sm">Authenticating your Google account…</p>}
            </div>
          )}

          <div
            style={{
              marginTop: '2.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--line)',
              fontSize: '0.85rem',
              color: 'var(--muted)',
            }}
          >
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>✓ One-click sign-in — no passwords to create or remember</li>
              <li>✓ Progress and test scores safely backed up to the cloud</li>
              <li>✓ Seamless across all your desktop and mobile devices</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
