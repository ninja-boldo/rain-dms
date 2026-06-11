import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./lib/AppContext";
import { useApp } from "./lib/AppContext";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Upload from "./pages/Upload";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Tags from "./pages/Tags";
import Login from "./pages/Login";
import "./index.css";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { auth } = useApp();
  if (!auth) return <Login />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AuthGate>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tags" element={<Tags />} />
            </Routes>
          </Layout>
        </AuthGate>
      </BrowserRouter>
    </AppProvider>
  );
}
