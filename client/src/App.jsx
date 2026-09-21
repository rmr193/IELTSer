import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useData } from './context/DataContext.jsx';
import Layout from './components/Layout.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Roadmap from './pages/Roadmap.jsx';
import Day from './pages/Day.jsx';
import Scores from './pages/Scores.jsx';
import Settings from './pages/Settings.jsx';

function Splash({ text = 'Loading your plan…', error }) {
  return <div className="splash" role="status">{error || text}</div>;
}

export default function App() {
  const { user, loading } = useAuth();
  const data = useData();

  if (loading) return <Splash />;
  if (!user) return <Auth />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={data.ready ? <Dashboard /> : <Splash error={data.error} />} />
        <Route path="/roadmap" element={data.ready ? <Roadmap /> : <Splash error={data.error} />} />
        <Route path="/day/:day" element={data.ready ? <Day /> : <Splash error={data.error} />} />
        <Route path="/scores" element={<Scores />} />
        <Route path="/settings" element={data.ready ? <Settings /> : <Splash error={data.error} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
