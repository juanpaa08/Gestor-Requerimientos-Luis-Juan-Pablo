import React, { createContext, useState, useEffect } from 'react';

// Creamos el contexto de autenticación
export const AuthContext = createContext(null);

// Proveedor de AuthContext para envolver la app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, intentamos recuperar el usuario de localStorage
  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored auth:', error);
      }
    }
    setLoading(false);
  }, []);

  // Función para iniciar sesión (por ejemplo tras validar credenciales)
  const login = ({ username, role, token }) => {
    const newUser = { username, role, token };
    localStorage.setItem('auth', JSON.stringify(newUser));
    setUser(newUser);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('auth');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
