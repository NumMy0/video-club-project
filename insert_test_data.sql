USE cinemateca;

START TRANSACTION;

-- 1) Peliculas (10 registros)
INSERT INTO peliculas (id_pelicula, titulo, genero, anio, clasificacion, descripcion)
VALUES
  (1, 'Mad Max: Fury Road', 'Accion', 2015, 'R', 'Persecucion postapocaliptica de alto impacto visual.'),
  (2, 'The Dark Knight', 'Accion', 2008, 'PG-13', 'Batman enfrenta al Joker en Gotham.'),
  (3, 'Blade Runner 2049', 'Sci-Fi', 2017, 'R', 'Investigacion futurista sobre identidad y memoria.'),
  (4, 'Interstellar', 'Sci-Fi', 2014, 'PG-13', 'Viaje interestelar para salvar a la humanidad.'),
  (5, 'Arrival', 'Sci-Fi', 2016, 'PG-13', 'Linguista descifra un lenguaje alienigena.'),
  (6, 'The Shawshank Redemption', 'Drama', 1994, 'R', 'Historia de esperanza y amistad en prision.'),
  (7, 'Whiplash', 'Drama', 2014, 'R', 'Ambicion, musica y disciplina extrema.'),
  (8, 'Parasite', 'Drama', 2019, 'R', 'Satira social sobre desigualdad de clases.'),
  (9, 'Inception', 'Sci-Fi', 2010, 'PG-13', 'Atraco mental dentro de suenos.'),
  (10, 'Gladiator', 'Accion', 2000, 'R', 'General romano convertido en gladiador.');

-- 2) Socios (5 registros)
INSERT INTO socios (dni, nombre, direccion, telefono, estado_cuenta, email)
VALUES
  ('30111222', 'Lucia Fernandez', 'Av. Santa Fe 2450, Piso 7, CABA', '+54 11 4823-7788', 'Activo', 'lucia.fernandez@example.com'),
  ('28555666', 'Martin Quiroga', 'Calle 52 Nro 1234, La Plata', '+54 221 477-1200', 'Activo', 'martin.quiroga@example.com'),
  ('33444999', 'Valentina Ruiz', 'San Martin 890, Rosario', '+54 341 512-3344', 'Deudor', 'valentina.ruiz@example.com'),
  ('27999888', 'Sergio Pereyra', 'Mitre 102, Cordoba', '+54 351 611-0099', 'Activo', 'sergio.pereyra@example.com'),
  ('31222333', 'Camila Torres', 'Belgrano 455, Mendoza', '+54 261 498-7721', 'Activo', 'camila.torres@example.com');

-- 3) Usuarios de staff (3 registros)
-- Nota: contrasena_hash debe almacenarse con bcrypt en produccion.
INSERT INTO usuarios (id_usuario, nombre, usuario, contrasena_hash, rol, activo)
VALUES
  (1, 'Ana Gomez', 'admin_ana', '$2b$10$pd5545bZlS3sZUaJyJpnn.rvbAwsOmzq22V89uX8zfnE02kVqQOyC', 'Admin', 1),
  (2, 'Diego Salas', 'vendedor_diego', '$2b$10$Vxg3OIIGP08TTc6zIBmj5OCJkbsRAHi1DZG2Jr70RLaWVF9KnL3u.', 'Vendedor', 1),
  (3, 'Paula Ibarra', 'vendedora_paula', '$2b$10$ftQd0AJAvbk2W03SFbbOse8k1bnfBp7D676aL05IgNKBvycrxCxbK', 'Vendedor', 1);

-- 4) Copias (25 registros)
-- El estado "En reparacion" se representa como "Reparacion" por el ENUM definido.
INSERT INTO copias (id_copia, id_pelicula, formato, estado_copia, codigo_barra)
VALUES
  (1, 1, 'Blu-ray', 'Disponible', 'CB-0001'),
  (2, 1, 'DVD', 'Alquilada', 'CB-0002'),
  (3, 1, 'DVD', 'Disponible', 'CB-0003'),

  (4, 2, 'Blu-ray', 'Disponible', 'CB-0004'),
  (5, 2, 'DVD', 'Alquilada', 'CB-0005'),
  (6, 2, 'Blu-ray', 'Disponible', 'CB-0006'),

  (7, 3, 'Blu-ray', 'Disponible', 'CB-0007'),
  (8, 3, 'DVD', 'Disponible', 'CB-0008'),
  (9, 3, 'DVD', 'Alquilada', 'CB-0009'),

  (10, 4, 'Blu-ray', 'Disponible', 'CB-0010'),
  (11, 4, 'DVD', 'Disponible', 'CB-0011'),
  (12, 4, 'Blu-ray', 'Disponible', 'CB-0012'),

  (13, 5, 'DVD', 'Alquilada', 'CB-0013'),
  (14, 5, 'Blu-ray', 'Disponible', 'CB-0014'),

  (15, 6, 'DVD', 'Disponible', 'CB-0015'),
  (16, 6, 'Blu-ray', 'Reparacion', 'CB-0016'),

  (17, 7, 'DVD', 'Disponible', 'CB-0017'),
  (18, 7, 'Blu-ray', 'Disponible', 'CB-0018'),

  (19, 8, 'DVD', 'Disponible', 'CB-0019'),
  (20, 8, 'Blu-ray', 'Disponible', 'CB-0020'),

  (21, 9, 'Blu-ray', 'Alquilada', 'CB-0021'),
  (22, 9, 'DVD', 'Disponible', 'CB-0022'),
  (23, 9, 'DVD', 'Disponible', 'CB-0023'),

  (24, 10, 'Blu-ray', 'Reparacion', 'CB-0024'),
  (25, 10, 'DVD', 'Disponible', 'CB-0025');

-- 5) Alquileres activos (3 registros, uno vencido)
INSERT INTO alquileres (
  id_alquiler,
  dni_socio,
  id_copia,
  fecha_salida,
  fecha_limite,
  fecha_retorno,
  id_usuario,
  observaciones
)
VALUES
  (
    1,
    '30111222',
    2,
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    NULL,
    2,
    'Alquiler activo vencido para pruebas de multa.'
  ),
  (
    2,
    '28555666',
    5,
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    DATE_ADD(NOW(), INTERVAL 3 DAY),
    NULL,
    3,
    'Alquiler activo dentro del plazo.'
  ),
  (
    3,
    '31222333',
    9,
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    DATE_ADD(NOW(), INTERVAL 4 DAY),
    NULL,
    2,
    'Alquiler activo reciente.'
  );

COMMIT;
