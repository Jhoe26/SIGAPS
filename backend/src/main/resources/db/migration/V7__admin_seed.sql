-- Usuario administrador inicial para acceso al sistema
-- DNI: 12345678 / Contraseña: admin123
-- BCrypt hash de 'admin123'
INSERT INTO usuario (dni, ap_paterno, ap_materno, nombres, rol, activo, es_sistema, password_hash)
VALUES ('12345678', 'ADMINISTRADOR', 'SISTEMA', 'ADMIN', 'ADMIN', TRUE, FALSE,
        '$2b$10$MvFl//T.6snubqcGtIslK.27Autq.VDVGbsudamVx6zLCeaPsRjqW');
