import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.title}>Gestor de Requerimientos</h1>
      <div className={styles.links}>
        <Link to="/" className={styles.link}>Inicio</Link>
        <Link to="/projects" className={styles.link}>Proyectos</Link>
      </div>
    </nav>
  );
}

