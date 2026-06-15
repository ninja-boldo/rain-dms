import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import SearchPage from "./pages/SearchPage";
import DocumentPage from "./pages/DocumentPage";
import StatsPage from "./pages/StatsPage";
import SettingsPage from "./pages/SettingsPage";
import FileStatsPage from "./pages/FileStatsPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<MainPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="document" element={<DocumentPage />} />
          <Route path="file-stats" element={<FileStatsPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
