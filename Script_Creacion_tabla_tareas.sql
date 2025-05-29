USE gestor_requerimientos;

CREATE TABLE Tareas (
  id_tarea INT AUTO_INCREMENT PRIMARY KEY,
  id_proyecto INT NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  prioridad ENUM('Alta', 'Media', 'Baja') DEFAULT 'Media',
  estado ENUM('Pendiente', 'En Progreso', 'Completado') DEFAULT 'Pendiente',
  fecha_limite DATE,
  asignado_a INT,
  FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto),
  FOREIGN KEY (asignado_a) REFERENCES Usuarios(id_usuario)
);