// src/components/UserManagement/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserManagement.module.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
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
          setUsers(data);
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
  }, [navigate]);

  const handleDelete = (id) => {
    const token = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).token : null;
    if (!token) {
      setError('No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }

    if (window.confirm('¿Seguro que quieres eliminar este usuario?')) {
      fetch(`http://localhost:5000/api/users/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
          if (res.ok) {
            setUsers(users.filter(user => user.id_usuario !== id));
          } else {
            throw new Error('Error al eliminar usuario');
          }
        })
        .catch(() => setError('Error al eliminar usuario'));
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-user/${id}`);
  };

  return (
    <div className={styles.container}>
      <h2>Gestión de Usuarios</h2>
      {error && <p className={styles.error}>{error}</p>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id_usuario}>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleEdit(user.id_usuario)}>Editar</button>
                <button onClick={() => handleDelete(user.id_usuario)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}