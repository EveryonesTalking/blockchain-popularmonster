import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotesPage from "./pages/NotesPage";
import Profile from "./pages/Profile";

const Wallet = lazy(() => import("./pages/Wallet"));

// =============================
// Protected Route Wrapper
// =============================
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// =============================
// Public Route (block login/register page if logged in)
// =============================
function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/landing" replace /> : children;
}

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* LOGIN PAGE (public only) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* REGISTER PAGE (public only) */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* LANDING / NOTES / WALLET / PROFILE (protected) */}
        <Route
          path="/landing"
          element={
            <PrivateRoute>
              <Landing />
            </PrivateRoute>
          }
        />

        <Route
          path="/notes"
          element={
            <PrivateRoute>
              <NotesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/wallet"
          element={
            <PrivateRoute>
              <Suspense fallback={<div>Loading Wallet...</div>}>
                <Wallet />
              </Suspense>
            </PrivateRoute>
          }
        />

      </Routes>
    </Router>
  );
}