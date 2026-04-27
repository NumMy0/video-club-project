CREATE DATABASE IF NOT EXISTS cinemateca
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE cinemateca;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS peliculas (
  id_pelicula INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  genero VARCHAR(100) NOT NULL,
  anio YEAR NOT NULL,
  clasificacion VARCHAR(20) NOT NULL,
  descripcion TEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_peliculas_titulo (titulo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS socios (
  dni VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  estado_cuenta ENUM('Activo', 'Deudor') NOT NULL DEFAULT 'Activo',
  email VARCHAR(150) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_socios_dni (dni)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  usuario VARCHAR(80) NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol ENUM('Admin', 'Vendedor') NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_usuarios_usuario (usuario)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS copias (
  id_copia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pelicula INT UNSIGNED NOT NULL,
  formato ENUM('DVD', 'Blu-ray') NOT NULL,
  estado_copia ENUM('Disponible', 'Alquilada', 'Reservada', 'Reparacion') NOT NULL DEFAULT 'Disponible',
  codigo_barra VARCHAR(50) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_copias_estado_copia (estado_copia),
  CONSTRAINT fk_copias_peliculas
    FOREIGN KEY (id_pelicula) REFERENCES peliculas (id_pelicula)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alquileres (
  id_alquiler BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dni_socio VARCHAR(20) NOT NULL,
  id_copia INT UNSIGNED NOT NULL,
  fecha_salida DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_limite DATETIME NOT NULL,
  fecha_retorno DATETIME NULL,
  id_usuario INT UNSIGNED NULL,
  observaciones VARCHAR(255) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_alquileres_socios
    FOREIGN KEY (dni_socio) REFERENCES socios (dni)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_alquileres_copias
    FOREIGN KEY (id_copia) REFERENCES copias (id_copia)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_alquileres_usuarios
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  INDEX idx_alquileres_dni_socio (dni_socio),
  INDEX idx_alquileres_id_copia (id_copia),
  INDEX idx_alquileres_id_usuario (id_usuario)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pagos (
  id_pago BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_alquiler BIGINT UNSIGNED NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  tipo_pago ENUM('Alquiler', 'Multa') NOT NULL,
  estado_pago ENUM('Pendiente', 'Pagado') NOT NULL DEFAULT 'Pendiente',
  metodo_pago ENUM('Caja', 'PasarelaWeb') NOT NULL,
  referencia_transaccion VARCHAR(100) NULL,
  fecha_pago DATETIME NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pagos_alquileres
    FOREIGN KEY (id_alquiler) REFERENCES alquileres (id_alquiler)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  INDEX idx_pagos_id_alquiler (id_alquiler),
  INDEX idx_pagos_estado_pago (estado_pago)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
