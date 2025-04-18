-- Ejecutar este script en tu base de datos SQLite para insertar registros de prueba

-- Insertar 30 reservas de prueba
INSERT INTO reservas (fecha, status, token, total, nombre, telefono, email, auto)
VALUES
('2025-05-01', '200', 'token001', 12500, 'Juan Pérez', '1123456789', 'juan@example.com', 'Ford Focus 2020'),
('2025-05-02', '200', 'token002', 15000, 'María García', '1145678901', 'maria@example.com', 'Chevrolet Cruze 2019'),
('2025-05-03', '200', 'token003', 9000, 'Carlos López', '1156789012', 'carlos@example.com', 'Volkswagen Golf 2021'),
('2025-05-04', '200', 'token004', 21000, 'Ana Martínez', '1167890123', 'ana@example.com', 'Toyota Corolla 2018'),
('2025-05-05', '200', 'token005', 18000, 'Pablo Rodríguez', '1178901234', 'pablo@example.com', 'Renault Sandero 2022'),
('2025-05-06', '200', 'token006', 14500, 'Lucía Fernández', '1189012345', 'lucia@example.com', 'Fiat Cronos 2023'),
('2025-05-07', '200', 'token007', 12000, 'Martín González', '1190123456', 'martin@example.com', 'Peugeot 208 2021'),
('2025-05-08', '200', 'token008', 16500, 'Carolina Torres', '1101234567', 'carolina@example.com', 'Honda HR-V 2022'),
('2025-05-09', '200', 'token009', 19000, 'Diego Sánchez', '1112345678', 'diego@example.com', 'Ford Ranger 2020'),
('2025-05-10', '200', 'token010', 9500, 'Valentina Díaz', '1123456780', 'valentina@example.com', 'Volkswagen T-Cross 2023'),
('2025-05-11', '200', 'token011', 11000, 'Sebastián Morales', '1134567890', 'sebastian@example.com', 'Chevrolet Onix 2021'),
('2025-05-12', '200', 'token012', 20500, 'Camila Suárez', '1145678901', 'camila@example.com', 'Toyota Hilux 2019'),
('2025-05-13', '200', 'token013', 13500, 'Joaquín Paz', '1156789012', 'joaquin@example.com', 'Nissan Versa 2022'),
('2025-05-14', '200', 'token014', 17000, 'Florencia Castro', '1167890123', 'florencia@example.com', 'Renault Duster 2020'),
('2025-05-15', '200', 'token015', 10500, 'Santiago Vargas', '1178901234', 'santiago@example.com', 'Fiat Toro 2021'),
('2025-05-16', 'pendiente', 'token016', 22000, 'Agustina Rivera', '1189012345', 'agustina@example.com', 'Citroen C4 2023'),
('2025-05-17', 'pendiente', 'token017', 8500, 'Federico Acosta', '1190123456', 'federico@example.com', 'Jeep Renegade 2022'),
('2025-05-18', 'pendiente', 'token018', 15500, 'Valeria Moreno', '1101234567', 'valeria@example.com', 'Peugeot 2008 2020'),
('2025-05-19', 'pendiente', 'token019', 14000, 'Nicolás Peralta', '1112345678', 'nicolas@example.com', 'Volkswagen Amarok 2019'),
('2025-05-20', 'cancelado', 'token020', 19500, 'Julieta Herrera', '1123456789', 'julieta@example.com', 'Honda Civic 2021'),
('2025-05-21', 'cancelado', 'token021', 11500, 'Tomás Flores', '1134567890', 'tomas@example.com', 'Ford EcoSport 2022'),
('2025-05-22', '200', 'token022', 13000, 'Martina Benítez', '1145678901', 'martina@example.com', 'Chevrolet S10 2020'),
('2025-05-23', '200', 'token023', 16000, 'Matías Vega', '1156789012', 'matias@example.com', 'Toyota Etios 2021'),
('2025-05-24', '200', 'token024', 18500, 'Sofía Luna', '1167890123', 'sofia@example.com', 'Renault Logan 2023'),
('2025-05-25', '200', 'token025', 9200, 'Gonzalo Rojas', '1178901234', 'gonzalo@example.com', 'Fiat Argo 2022'),
('2025-05-26', '200', 'token026', 12200, 'Catalina Ortiz', '1189012345', 'catalina@example.com', 'Volkswagen Vento 2020'),
('2025-05-27', '200', 'token027', 17500, 'Ignacio Paredes', '1190123456', 'ignacio@example.com', 'Honda WR-V 2021'),
('2025-05-28', '200', 'token028', 14200, 'Delfina Campos', '1101234567', 'delfina@example.com', 'Toyota SW4 2019'),
('2025-05-29', '200', 'token029', 20000, 'Lautaro Navarro', '1112345678', 'lautaro@example.com', 'Ford Mustang 2022'),
('2025-05-30', '200', 'token030', 10000, 'Victoria Méndez', '1123456789', 'victoria@example.com', 'Audi A3 2020');

-- Insertar servicios para cada reserva
-- Para la reserva 1
INSERT INTO servicios (reserva_id, nombre, subtipo, atributo, valor, tamaño)
VALUES
(1, 'Fumé ópticas', NULL, 'tipo', 'simple', 'med'),
(1, 'Fumé ópticas', NULL, 'precio', '5000', 'med'),
(1, 'Fumé ópticas', NULL, 'descripcion', 'Oscurecimiento de faros con acabado profesional', 'med'),
(1, 'Cromados a medida', NULL, 'tipo', 'simple', 'med'),
(1, 'Cromados a medida', NULL, 'precio', '7500', 'med'),
(1, 'Cromados a medida', NULL, 'descripcion', 'Cromado de parrilla delantera', 'med');

-- Para algunas reservas más (solo un ejemplo, puedes expandir para todas)
INSERT INTO servicios (reserva_id, nombre, subtipo, atributo, valor, tamaño)
VALUES
(2, 'Fumé ópticas', NULL, 'tipo', 'simple', 'med'),
(2, 'Fumé ópticas', NULL, 'precio', '5000', 'med'),
(2, 'Fumé ópticas', NULL, 'descripcion', 'Oscurecimiento de faros con acabado profesional', 'med'),
(2, 'Polarizado', 'Premium', 'tipo', 'complejo', 'full'),
(2, 'Polarizado', 'Premium', 'precio', '10000', 'full'),
(2, 'Polarizado', 'Premium', 'descripcion', 'Polarizado completo con garantía 5 años', 'full');

-- Para otras reservas aleatorias
INSERT INTO servicios (reserva_id, nombre, subtipo, atributo, valor, tamaño)
VALUES
(5, 'Polarizado', 'Standard', 'tipo', 'simple', 'med'),
(5, 'Polarizado', 'Standard', 'precio', '8000', 'med'),
(5, 'Polarizado', 'Standard', 'descripcion', 'Polarizado standard con garantía 3 años', 'med'),
(5, 'Detailing', NULL, 'tipo', 'completo', 'full'),
(5, 'Detailing', NULL, 'precio', '10000', 'full'),
(5, 'Detailing', NULL, 'descripcion', 'Detailing completo interior y exterior', 'full');

-- Agrega servicios para más reservas según necesites
INSERT INTO servicios (reserva_id, nombre, subtipo, atributo, valor, tamaño)
VALUES
(10, 'Wrapping', 'Vinilo Mate', 'tipo', 'complejo', 'full'),
(10, 'Wrapping', 'Vinilo Mate', 'precio', '9500', 'full'),
(10, 'Wrapping', 'Vinilo Mate', 'descripcion', 'Wrapping completo en vinilo mate negro', 'full');

-- Y más servicios para otras reservas
INSERT INTO servicios (reserva_id, nombre, subtipo, atributo, valor, tamaño)
VALUES
(15, 'Fumé ópticas', NULL, 'tipo', 'simple', 'med'),
(15, 'Fumé ópticas', NULL, 'precio', '5000', 'med'),
(15, 'Fumé ópticas', NULL, 'descripcion', 'Oscurecimiento de faros con acabado profesional', 'med'),
(15, 'Tintado de luces traseras', NULL, 'tipo', 'simple', 'med'),
(15, 'Tintado de luces traseras', NULL, 'precio', '5500', 'med'),
(15, 'Tintado de luces traseras', NULL, 'descripcion', 'Tintado de luces traseras con film homologado', 'med');

-- Servicios para otras reservas
INSERT INTO servicios (reserva_id, nombre, subtipo, atributo, valor, tamaño)
VALUES
(20, 'Detailing', 'Premium', 'tipo', 'completo', 'full'),
(20, 'Detailing', 'Premium', 'precio', '12000', 'full'),
(20, 'Detailing', 'Premium', 'descripcion', 'Detailing premium interior y exterior con sellado cerámico', 'full'),
(20, 'Tratamiento cerámico', NULL, 'tipo', 'complejo', 'full'),
(20, 'Tratamiento cerámico', NULL, 'precio', '7500', 'full'),
(20, 'Tratamiento cerámico', NULL, 'descripcion', 'Protección cerámica con duración 12 meses', 'full');