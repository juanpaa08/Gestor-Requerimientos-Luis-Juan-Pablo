import React, { useContext }                    from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Settings from './pages/Settings';

// Contexto – ahora VIVE en src/context/AuthContext.jsx
import { AuthProvider, AuthContext } from './context/AuthContext';

// Componentes y páginas – en src/components/... y src/pages/...
import Navbar    from './components/Navbar/Navbar';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Home      from './pages/Home';
import Projects  from './pages/Projects';

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;            // o un spinner
  if (!user)    return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/login"    element={<Login />} />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
