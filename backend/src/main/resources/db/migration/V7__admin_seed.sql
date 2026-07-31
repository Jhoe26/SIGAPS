-- Usuario administrador inicial para acceso al sistema
-- DNI: 12345678 / Contraseña: Admin1234
-- BCrypt hash de 'Admin1234'

-- Primero elimina si existe
DELETE FROM usuario WHERE dni = '12345678' AND nombres = 'ADMIN';

-- Luego inserta
INSERT INTO usuario (dni, ap_paterno, ap_materno, nombres, rol, activo, es_sistema, password_hash)
VALUES ('12345678', 'ADMINISTRADOR', 'SISTEMA', 'ADMIN', 'ADMIN', TRUE, FALSE,
        '$2b$10$XeJlbpYidpSP/2QU8.dx0uEfFIxPeHZRktECfvU237jWaS.xo8YOK');
