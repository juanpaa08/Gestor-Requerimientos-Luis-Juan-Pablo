// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate }                   from 'react-router-dom';
import styles                            from './Register.module.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [role, setRole]         = useState('Gestor');
  const nav                     = useNavigate();
  const [password, setPassword] = useState('');
   const [confirmarPassword, confirmPassword] = useState ('');


  const handleSubmit = e => {
    e.preventDefault();
    // Aquí iría la llamada real a tu backend para registrar...
    nav('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Registro</h2>
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
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
          </div>

          {/*Nuevo campo confirmar contrasena */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
            <input
              id="confirmarPassword"
              type="confirmarPassword"
              value={confirmarPassword}
              onChange={e => confirmPassword(e.target.value)}
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
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
}
