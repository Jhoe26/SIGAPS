CREATE TABLE poblacion_acreditada (
    dni                     CHAR(8) PRIMARY KEY,
    ap_paterno              VARCHAR(60),
    ap_materno              VARCHAR(60),
    nombres                 VARCHAR(80),
    fecha_nacimiento        DATE,
    sexo                    ENUM('M','F'),
    direccion               VARCHAR(200),
    distrito                VARCHAR(60),
    parentesco              VARCHAR(30),
    dni_titular             CHAR(8),
    codigo_cas              VARCHAR(10),
    nombre_cas              VARCHAR(120),
    fecha_carga             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pob_apellidos (ap_paterno, ap_materno),
    INDEX idx_pob_distrito (distrito)
) ENGINE=InnoDB;

INSERT INTO vacuna_catalogo (codigo, nombre, grupo_edad, num_dosis_esquema, descripcion, activa)
VALUES ('SIN_CLAS', 'Vacuna sin clasificar (histórico)', 'MAYOR_5A', 1, 'Usada para migrar registros PAI del Excel de enfermería cuya vacuna no coincide con el catálogo', TRUE);
