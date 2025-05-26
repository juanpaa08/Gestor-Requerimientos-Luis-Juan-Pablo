import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Settings from './pages/Settings';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import UserManagement from './components/UserManagement/UserManagement'; // MU-002
import EditUser from './components/EditUser/EditUser'; // MU-002

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null; // Espera mientras se carga el estado
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/settings" element={<Settings />} />

          {/* RUTAS PROTEGIDAS */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:idProyecto"
            element={
              <PrivateRoute>
                <ProjectDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <PrivateRoute>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-user/:id"
            element={
              <PrivateRoute>
                <EditUser />
              </PrivateRoute>
            }
          />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}