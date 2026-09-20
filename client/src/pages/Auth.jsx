import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { dateKey } from '../utils.js';

export default function Auth() {
  const { login, register, verifyEmail, resendVerification } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const verifyTokenParam = searchParams.get('verifyToken');
  const resetTokenParam = searchParams.get('resetToken');

  const [mode, setMode] = useState(
    verifyTokenParam ? 'verify' : resetTokenParam ? 'reset' : 'login'
  );

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    resetToken: resetTokenParam || '',
  });

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [verifyState, setVerifyState] = useState(verifyTokenParam ? 'verifying' : 'idle');

  // Automatically attempt verification if verifyToken is present in the URL
  useEffect(() => {
    if (!verifyTokenParam) return;
    setMode('verify');
    setVerifyState('verifying');
    setError('');

    verifyEmail(verifyTokenParam)
      .then(() => {
        setVerifyState('success');
        setNotice('Email verified successfully! Welcome to IELTS 90-Day Mastery.');
        // Clean URL param
        searchParams.delete('verifyToken');
        setSearchParams(searchParams, { replace: true });
      })
      .catch((err) => {
        setVerifyState('error');
        setError(err.message || 'Verification link is invalid or has expired.');
      });
  }, [verifyTokenParam, verifyEmail, searchParams, setSearchParams]);

  // Keep resetToken in sync if URL changes
  useEffect(() => {
    if (resetTokenParam) {
      setMode('reset');
      setForm((f) => ({ ...f, resetToken: resetTokenParam }));
    }
  }, [resetTokenParam]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const clearMessages = () => {
    setError('');
    setNotice('');
  };

  async function submit(e) {
    e.preventDefault();
    clearMessages();
    setBusy(true);

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else if (mode === 'register') {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          startDate: dateKey(),
        });
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword({ email: form.email });
        setNotice(res.message || 'Check your inbox for password reset instructions.');
      } else if (mode === 'reset') {
        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match. Please retype.');
        }
        if (form.password.length < 6) {
          throw new Error('Password must have at least 6 characters.');
        }
        const res = await api.resetPassword({
          token: form.resetToken,
          password: form.password,
        });
        setNotice(res.message || 'Password reset successful!');
        // Automatically switch to login after brief delay
        setTimeout(() => {
          searchParams.delete('resetToken');
          setSearchParams(searchParams, { replace: true });
          setMode('login');
          setNotice('Password updated. You can now sign in with your new password.');
        }, 1200);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResend(e) {
    if (e) e.preventDefault();
    clearMessages();
    if (!form.email) {
      setError('Please enter your email address to resend verification.');
      return;
    }
    setBusy(true);
    try {
      const res = await resendVerification(form.email);
      setNotice(res.message || 'Verification email sent! Check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <section className="auth-intro">
        <div className="brand brand-lg">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="brand-name">IELTS 90-Day Mastery Platform</span>
        </div>
        <h1>From foundations to Band 8.0+ in 90 days.</h1>
        <p>
          Six phases, 90 days and 449 study tasks across Listening, Reading, Writing,
          Speaking, vocabulary and grammar. Tick off each task and watch your progress climb.
        </p>
        <ul className="auth-facts">
          <li><strong>6</strong> phases</li>
          <li><strong>90</strong> days</li>
          <li><strong>449</strong> tasks</li>
        </ul>
      </section>

      <section className="auth-card">
        {/* Verification Status Card */}
        {mode === 'verify' && (
          <div className="auth-verify-view">
            <h2>Email Verification</h2>
            {verifyState === 'verifying' && (
              <div className="auth-status-box">
                <p>Verifying your email token…</p>
              </div>
            )}
            {verifyState === 'success' && (
              <div className="auth-status-box success">
                <p className="success-msg">✓ {notice}</p>
                <p className="muted">Redirecting you to your study plan…</p>
              </div>
            )}
            {verifyState === 'error' && (
              <div className="auth-status-box error">
                <p className="error" role="alert">{error}</p>
                <p className="muted" style={{ marginTop: '0.75rem' }}>
                  Verification links expire after 24 hours. Enter your email below to receive a new one:
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <label className="field">Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                  </label>
                  <button className="btn btn-block" onClick={handleResend} disabled={busy}>
                    {busy ? 'Sending…' : 'Resend Verification Email'}
                  </button>
                  {notice && <p className="success-msg" style={{ marginTop: '0.75rem' }}>{notice}</p>}
                </div>
              </div>
            )}
            <p className="switch" style={{ marginTop: '1.5rem' }}>
              <button
                className="link-btn"
                onClick={() => {
                  setMode('login');
                  clearMessages();
                }}
              >
                Return to sign in
              </button>
            </p>
          </div>
        )}

        {/* Forgot Password View */}
        {mode === 'forgot' && (
          <div>
            <h2>Forgot password</h2>
            <p className="muted" style={{ marginBottom: '1.25rem' }}>
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            <form onSubmit={submit} noValidate>
              <label className="field">Email
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              {error && <p className="error" role="alert">{error}</p>}
              {notice && <p className="success-msg" role="status">{notice}</p>}

              <button className="btn btn-block" disabled={busy}>
                {busy ? 'Sending reset link…' : 'Send Reset Link'}
              </button>
            </form>

            <p className="switch">
              Remember your password?{' '}
              <button
                className="link-btn"
                onClick={() => {
                  setMode('login');
                  clearMessages();
                }}
              >
                Sign in
              </button>
            </p>
          </div>
        )}

        {/* Reset Password View */}
        {mode === 'reset' && (
          <div>
            <h2>Set a new password</h2>
            <p className="muted" style={{ marginBottom: '1.25rem' }}>
              Enter a strong password with at least 6 characters.
            </p>
            <form onSubmit={submit} noValidate>
              <label className="field">New Password
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </label>
              <label className="field">Confirm New Password
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </label>

              {error && <p className="error" role="alert">{error}</p>}
              {notice && <p className="success-msg" role="status">{notice}</p>}

              <button className="btn btn-block" disabled={busy}>
                {busy ? 'Saving…' : 'Update Password'}
              </button>
            </form>

            <p className="switch">
              <button
                className="link-btn"
                onClick={() => {
                  setMode('login');
                  clearMessages();
                }}
              >
                Cancel and return to sign in
              </button>
            </p>
          </div>
        )}

        {/* Login & Register Views */}
        {(mode === 'login' || mode === 'register') && (
          <div>
            <h2>{mode === 'login' ? 'Sign in' : 'Create your account'}</h2>
            <form onSubmit={submit} noValidate>
              {mode === 'register' && (
                <label className="field">Name
                  <input
                    value={form.name}
                    onChange={set('name')}
                    autoComplete="name"
                    required
                  />
                </label>
              )}
              <label className="field">Email
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  required
                />
              </label>
              <div className="field-group">
                <label className="field">Password
                  <input
                    type="password"
                    value={form.password}
                    onChange={set('password')}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={6}
                    required
                  />
                </label>
                {mode === 'login' && (
                  <div className="field-sublink">
                    <button
                      type="button"
                      className="link-btn text-sm"
                      onClick={() => {
                        setMode('forgot');
                        clearMessages();
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>

              {error && <p className="error" role="alert">{error}</p>}
              {notice && <p className="success-msg" role="status">{notice}</p>}

              <button className="btn btn-block" disabled={busy}>
                {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Start Day 1'}
              </button>
            </form>

            <p className="switch">
              {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
              <button
                className="link-btn"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  clearMessages();
                }}
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
