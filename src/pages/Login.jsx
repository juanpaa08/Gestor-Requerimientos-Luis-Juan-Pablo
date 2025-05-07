import React, { useState, useContext } from 'react';
import { useNavigate }                   from 'react-router-dom';
import { AuthContext }                   from '../context/AuthContext';
import styles                            from './Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [role, setRole]         = useState('Gestor');
  const { login }               = useContext(AuthContext);
  const nav                     = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    login({ username, role, token: 'abc123' });
    nav('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value)}
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
      </div>
    </div>
  );
}
