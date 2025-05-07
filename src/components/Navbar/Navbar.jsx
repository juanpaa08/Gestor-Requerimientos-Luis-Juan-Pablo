// src/components/Navbar/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav('/login');
  };

  return (
    <nav className={styles.navbar}>
      <h1 className={styles.title}>Gestor de Requerimientos</h1>
      <div className={styles.links}>
        {user ? (
          <>
            <span style={{ color: 'white' }}>{user.username} ({user.role})</span>
            <Link to="/"        className={styles.link}>Inicio</Link>
            <Link to="/projects" className={styles.link}>Proyectos</Link>
            <button onClick={handleLogout} className={styles.link}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className={styles.link}>Login</Link>
            <Link to="/register" className={styles.link}>Registro</Link>
          </>
        )}
      </div>
    </nav>
  );
}
