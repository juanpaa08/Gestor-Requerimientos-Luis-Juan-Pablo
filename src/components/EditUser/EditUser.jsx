// src/components/EditUser/EditUser.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './EditUser.module.css';

export default function EditUser() {
  const { id } = useParams();
  const [user, setUser] = useState({ username: '', role: 'Gestor' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).token : null;
    if (!token) {
      setError('No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }

    fetch('http://localhost:5000/api/users/list', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error('Acceso denegado: Solo los Admins pueden listar usuarios');
          }
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const foundUser = data.find(u => u.id_usuario === parseInt(id));
          if (foundUser) {
            setUser(foundUser);
          } else {
            setError('Usuario no encontrado');
          }
        } else {
          throw new Error('La respuesta del servidor no es una lista de usuarios');
        }
      })
      .catch(err => {
        setError(err.message);
        if (err.message.includes('Acceso denegado')) {
          navigate('/'); // Redirige si no tiene permisos
        }
      });
  }, [id, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).token : null;
    if (!token) {
      setError('No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }

    fetch(`http://localhost:5000/api/users/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    })
      .then(res => {
        if (res.ok) {
          navigate('/user-management');
        } else {
          throw new Error('Error al actualizar usuario');
        }
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className={styles.container}>
      <h2>Editar Usuario</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
          />
        </div>
        <div>
          <label>Rol:</label>
          <select
            value={user.role}
            onChange={(e) => setUser({ ...user, role: e.target.value })}
          >
            <option>Admin</option>
            <option>Gestor</option>
            <option>Colaborador</option>
          </select>
        </div>
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}