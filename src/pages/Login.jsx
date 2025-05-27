import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, UserCheck } from 'lucide-react';
import styles from './Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Gestor');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
      login({ username: data.username, role: data.role, token: data.token });
      nav('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <UserCheck size={32} className={styles.headerIcon} />
          <h2 className={styles.title}>Iniciar sesión</h2>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              <User size={18} className={styles.icon} /> Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              <Lock size={18} className={styles.icon} /> Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>
              <User size={18} className={styles.icon} /> Rol
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={styles.select}
            >
              <option>Admin</option>
              <option>Gestor</option>
              <option>Colaborador</option>
            </select>
          </div>

          <button type="submit" className={styles.button}>
            Entrar
          </button>
        </form>

        <div className={styles.footer}>
          <span>¿No tienes cuenta?</span>{' '}
          <Link to="/register" className={styles.registerLink}>
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}