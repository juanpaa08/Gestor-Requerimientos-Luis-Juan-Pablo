import styles from './RequirementCard.module.css';

export default function RequirementCard({ title, description, status }) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className={`${styles.status} ${styles[status]}`}>
        {status}
      </span>
    </div>
  );
}