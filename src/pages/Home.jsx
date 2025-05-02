import RequirementCard from '../components/RequirementCard/RequirementCard';

export default function Home() {
  return (
    <div>
      <h2>Requerimientos Recientes</h2>
      <RequirementCard 
        title="Login de usuario" 
        description="Implementar autenticación con Google"
        status="en-progreso"
      />
    </div>
  );
}