// src/pages/Register.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, UserCheck } from 'lucide-react';
import styles from './Register.module.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Gestor');
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`; 
      }

      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          username,
          password,
          role,
          currentRole: user ? user.role : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }
      nav('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <UserCheck size={32} className={styles.headerIcon} />
          <h2 className={styles.title}>Registrar</h2>
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.formWrapper}>
          <form id="register-form" onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>
                <User size={18} className={styles.icon} /> Usuario
              </label>
              <input
                id="username"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu email"
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
              <label htmlFor="confirmPassword" className={styles.label}>
                <Lock size={18} className={styles.icon} /> Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
          </form>
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit" form="register-form" className={styles.button}>
            Registrar
          </button>
        </div>
        <div className={styles.footer}>
          <span>¿Ya tienes cuenta?</span>{' '}
          <Link to="/login" className={styles.registerLink}>
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}