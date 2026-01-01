import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import Settings from './pages/Settings';
import { api, getToken } from './lib/api';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function InitializationCheck() {
  const [initialized, setInitialized] = useState<boolean | null>(null);

  useEffect(() => {
    api.checkInitialization()
      .then((data) => setInitialized(data.initialized))
      .catch(() => setInitialized(false));
  }, []);

  if (initialized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-primary border-r-transparent mb-4"></div>
          <p className="text-gray-400">Checking system status...</p>
        </div>
      </div>
    );
  }

  if (!initialized) {
    return <Navigate to="/setup" />;
  }

  return <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter basename="/AliasVault" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<InitializationCheck />} />
      </Routes>
    </BrowserRouter>
  );
}
