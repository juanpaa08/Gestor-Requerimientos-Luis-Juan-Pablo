CREATE DATABASE gestor_requerimientos;

USE gestor_requerimientos;

CREATE TABLE Proyectos (
  id_proyecto INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  creado_por VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla Usuarios
DROP TABLE IF EXISTS `Usuarios`;
CREATE TABLE `Usuarios` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL, -- Almacenar contraseñas hasheadas
  `role` ENUM('Admin', 'Gestor', 'Colaborador') NOT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Agregar el campo status a la tabla Proyectos
ALTER TABLE `Proyectos`
ADD COLUMN `status` ENUM('Pendiente', 'En Progreso', 'Completado') DEFAULT 'Pendiente';

-- Insertar usuarios de prueba (contraseñas hasheadas: 123456)
INSERT INTO `Usuarios` (`username`, `password`, `role`)
VALUES 
  ('admin', '$2b$10$z9k9e9vG8g9vL9vM9nL9uO9w9x9y9z9A9B9C9D9E9F9G9H9I9J9K', 'Admin'),
  ('testuser', '$2b$10$z9k9e9vG8g9vL9vM9nL9uO9w9x9y9z9A9B9C9D9E9F9G9H9I9J9K', 'Gestor');
  
