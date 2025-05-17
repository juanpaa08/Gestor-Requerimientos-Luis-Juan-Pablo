USE gestor_requerimientos;

CREATE TABLE Requerimientos (
  id_requerimiento INT AUTO_INCREMENT PRIMARY KEY,
  id_proyecto INT NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  descripcion TEXT,
  tipo ENUM('Funcional', 'No Funcional', 'Técnico') NOT NULL,
  prioridad ENUM('Alta', 'Media', 'Baja') DEFAULT 'Media',
  estado ENUM('Pendiente', 'En Progreso', 'Completado', 'En Revisión') DEFAULT 'Pendiente',
  asignado_a INT, -- ID del usuario asignado (opcional)
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
  FOREIGN KEY (asignado_a) REFERENCES Usuarios(id_usuario)
);
