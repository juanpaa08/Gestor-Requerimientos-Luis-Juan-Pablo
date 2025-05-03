import React, { useState } from 'react';
import RequirementCard from '../components/RequirementCard/RequirementCard';
import './Home.css';

export default function Home() {
  const [requirements] = useState([
    { id: 1, title: "CREAR PROYECTO", description: "", status: "" },
    { id: 2, title: "EDITAR PROYECTO", description: "", status: "" },
    { id: 3, title: "ELIMINAR PROYECTO", description: "", status: "" }
  ]);

  const handleCardClick = (id) => {
    alert(`Acción: ${requirements.find(r => r.id === id).title}`);
  };

  return (
    <div className="home-container">
      <div className="title-container">
        <h1 className="brightreq-title">BrightReq</h1>
      </div>

      <div className="requirements-container">
        {requirements.map((req) => (
          <div 
            key={req.id}
            className="card-wrapper green-border"
            onClick={() => handleCardClick(req.id)}
          >
            <RequirementCard
              title={req.title}
              description={req.description}
              status={req.status}
            />
          </div>
        ))}
      </div>
    </div>
  );
}