import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: 'Dashboard', end: true, icon: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
    { to: data.ready ? `/day/${data.currentDay}` : '/', label: 'Today', icon: 'M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z', match: '/day' },
    { to: '/roadmap', label: 'Roadmap', icon: 'M3 20h5v-5h5v-5h8' },
    { to: '/scores', label: 'Scores', icon: 'M4 20V10M10 20V4M16 20v-8M22 20H2' },
    { to: '/settings', label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z' },
  ];

  return (
    <div className="shell">
      {/* Mobile Top Header */}
      <header className="mobile-topbar" aria-label="Mobile Navigation">
        <NavLink to="/" className="mobile-brand" aria-label="Go to Dashboard">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="mobile-brand-title">IELTS 90-Day</span>
        </NavLink>
        <NavLink to="/settings" className="mobile-profile-link" title="Open profile & settings" aria-label="Profile and Settings">
          <span className="mobile-band-badge">Band {Number(user?.targetBand || 8).toFixed(1)}</span>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="avatar avatar-sm avatar-img"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="avatar avatar-sm" aria-hidden="true">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </NavLink>
      </header>

      {/* Sidebar on Desktop / Bottom Navigation on Mobile */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="brand-name">IELTS 90-Day<br />Mastery Platform</span>
        </div>
        <nav aria-label="Main">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link ${isActive || (l.match && pathname.startsWith(l.match)) ? 'active' : ''}`}
            >
              <Icon d={l.icon} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-user">
          <div className="side-user-profile">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="avatar avatar-img"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="avatar" aria-hidden="true">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="side-user-text">
              <strong title={user?.name}>{user?.name}</strong>
              <span>Target band {Number(user?.targetBand || 8).toFixed(1)}</span>
            </div>
          </div>
          <button
            type="button"
            className="side-logout-btn"
            onClick={() => { logout(); navigate('/'); }}
            title="Sign out of your account"
            aria-label="Sign out"
          >
            <svg
              className="logout-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="main" id="main">
        {data.error && (
          <div className="banner" role="alert">
            <span>{data.error}</span>
            {data.clearError && <button className="link-btn" onClick={data.clearError}>Dismiss</button>}
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
