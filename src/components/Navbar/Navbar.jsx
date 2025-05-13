// src/components/Navbar/Navbar.jsx
import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const handleLogout = () => {
    logout();
    nav('/login');
  };

  // Cierra el dropdown si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.title}>
        Gestor de Requerimientos
      </Link>

      {user ? (
        <div className={styles.right}>
          <div
            className={styles.userMenu}
            ref={menuRef}
            onClick={() => setMenuOpen((v) => !v)}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setMenuOpen((v) => !v)}
          >
            <span className={styles.userBadge}>
              {user.username} ({user.role})
            </span>
            <div className={`${styles.dropdown} ${menuOpen ? styles.open : ''}`}>
              <Link to="/settings" className={styles.dropdownItem}>
                <SettingsIcon size={16} /> Ajustes
              </Link>
              <button onClick={handleLogout} className={styles.dropdownItem}>
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          </div>

          <Link
            to="/"
            className={`${styles.link} ${isActive('/') ? styles.active : ''}`}
          >
            Inicio
          </Link>
          <Link
            to="/projects"
            className={`${styles.link} ${isActive('/projects') ? styles.active : ''}`}
          >
            Proyectos
          </Link>
        </div>
      ) : (
        <div className={styles.right}>
          <Link to="/login" className={styles.link}>
            Login
          </Link>
          <Link to="/register" className={styles.link}>
            Registro
          </Link>
        </div>
      )}
    </nav>
  );
}
