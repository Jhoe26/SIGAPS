-- ============================================================
-- SIGAPS - Sistema Integral de Gestión de Atención Primaria
-- BD: sigaps_db  |  MySQL 8.0+
-- Fase 1: 15 tablas (4 núcleo + 2 catálogos + 9 clínicas)
-- Autor: Jhoe | CAPI III-M Ayacucho
--
-- NOTA (Fase A): a partir de aquí el esquema lo gestiona Flyway.
-- Este archivo queda como referencia histórica (= V1 de Flyway).
-- La evolución real del esquema está en:
--   backend/src/main/resources/db/migration/
-- ============================================================

DROP DATABASE IF EXISTS sigaps_db;
CREATE DATABASE sigaps_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE sigaps_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- NÚCLEO
-- ============================================================

CREATE TABLE usuario (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    dni               CHAR(8) NOT NULL UNIQUE,
    ap_paterno        VARCHAR(60) NOT NULL,
    ap_materno        VARCHAR(60) NOT NULL,
    nombres           VARCHAR(80) NOT NULL,
    colegiatura       VARCHAR(20),
    titulo            VARCHAR(20)         COMMENT 'Lic./Dr./Mg./etc',
    rol               ENUM('ENFERMERA','MEDICO','ADMIN','SISTEMA') NOT NULL,
    email             VARCHAR(120),
    telefono          VARCHAR(15),
    password_hash     VARCHAR(255)        COMMENT 'BCrypt; NULL para usuarios SISTEMA',
    activo            BOOLEAN NOT NULL DEFAULT TRUE,
    es_sistema        BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'TRUE = MIGRACION_HISTORICA, no login',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usuario_dni (dni),
    INDEX idx_usuario_activo (activo)
) ENGINE=InnoDB;

CREATE TABLE paciente (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    dni               CHAR(8) NOT NULL UNIQUE,
    ap_paterno        VARCHAR(60) NOT NULL,
    ap_materno        VARCHAR(60) NOT NULL,
    nombres           VARCHAR(80) NOT NULL,
    fecha_nacimiento  DATE NOT NULL,
    sexo              ENUM('M','F') NOT NULL,
    telefono          VARCHAR(15),
    direccion         VARCHAR(200),
    distrito          VARCHAR(60),
    tipo_seguro       ENUM('SIS','ESSALUD','PRIVADO','NINGUNO') DEFAULT 'NINGUNO',
    es_historico      BOOLEAN NOT NULL DEFAULT FALSE,
    fuente_origen     VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
    activo            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_paciente_dni (dni),
    INDEX idx_paciente_apellidos (ap_paterno, ap_materno),
    INDEX idx_paciente_fecha_nac (fecha_nacimiento)
) ENGINE=InnoDB;

CREATE TABLE parametro_sistema (
    clave             VARCHAR(60) PRIMARY KEY,
    valor             VARCHAR(255) NOT NULL,
    descripcion       VARCHAR(255),
    tipo_dato         ENUM('STRING','DECIMAL','INTEGER','BOOLEAN','DATE') DEFAULT 'STRING',
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE audit_log (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id        BIGINT NOT NULL,
    tabla             VARCHAR(60) NOT NULL,
    registro_id       BIGINT NOT NULL,
    accion            ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    valores_antes     JSON,
    valores_despues   JSON,
    ip_origen         VARCHAR(45),
    user_agent        VARCHAR(255),
    timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_usuario (usuario_id),
    INDEX idx_audit_tabla_reg (tabla, registro_id),
    INDEX idx_audit_timestamp (timestamp),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

-- ============================================================
-- CATÁLOGOS
-- ============================================================

CREATE TABLE vacuna_catalogo (
    id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
    codigo                VARCHAR(20) NOT NULL UNIQUE,
    nombre                VARCHAR(120) NOT NULL,
    grupo_edad            ENUM('MENOR_12M','12M_5A','MAYOR_5A','7A_15A','GESTANTE') NOT NULL,
    num_dosis_esquema     TINYINT NOT NULL,
    descripcion           VARCHAR(255),
    activa                BOOLEAN NOT NULL DEFAULT TRUE,
    vigente_desde         DATE,
    vigente_hasta         DATE,
    INDEX idx_vacuna_grupo (grupo_edad, activa)
) ENGINE=InnoDB;

CREATE TABLE dx_nutricional_catalogo (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    codigo            VARCHAR(20) NOT NULL UNIQUE,
    descripcion       VARCHAR(120) NOT NULL,
    grupo_edad        ENUM('MENOR_5A','MAYOR_5A','AMBOS') NOT NULL,
    activo            BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- ============================================================
-- CLÍNICAS (9 tablas = 9 hojas Excel)
-- ============================================================

-- Hoja: TAMIZAJE
CREATE TABLE tamizaje_hb (
    id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
    paciente_id           BIGINT NOT NULL,
    registrado_por_id     BIGINT NOT NULL,
    fecha                 DATE NOT NULL,
    edad_anios            TINYINT             COMMENT 'DATEDIF Y en momento del tamizaje',
    edad_meses            TINYINT             COMMENT 'DATEDIF YM',
    edad_dias             TINYINT             COMMENT 'DATEDIF MD',
    grupo_etario          ENUM('MENOR_6M','6_11M','12M_23M','2A','3A','4A','5A_MAS') NOT NULL,
    tipo_dosaje           ENUM('DOSAJE','SIN_DOSAJE') NOT NULL,
    hb_observado          DECIMAL(4,2)        COMMENT 'g/dL',
    hb_corregido          DECIMAL(4,2)        COMMENT 'hb_observado - 1.8 (Ayacucho)',
    observaciones         TEXT,
    es_historico          BOOLEAN NOT NULL DEFAULT FALSE,
    fuente_origen         VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tamiz_paciente (paciente_id),
    INDEX idx_tamiz_reg (registrado_por_id),
    INDEX idx_tamiz_fecha (fecha),
    FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    FOREIGN KEY (registrado_por_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

-- Hoja: ANEMIA (doble registro enfermería/médico hasta 3 controles)
CREATE TABLE anemia_seguimiento (
    id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
    paciente_id           BIGINT NOT NULL,
    registrado_por_id     BIGINT NOT NULL     COMMENT 'usuario que abrió el caso',
    fecha_inicio          DATE NOT NULL,
    hb_inicial_obs        DECIMAL(4,2),
    hb_inicial_corr       DECIMAL(4,2)        COMMENT 'hb_inicial_obs - 1.8',
    dx_inicial            ENUM('LEVE','MODERADA','SEVERA') NOT NULL,
    tipo_hierro           ENUM('SULFATO_FERROSO','HIERRO_POLIMALTOSADO','OTRO'),
    dosis_indicada        VARCHAR(100),
    -- 1er control
    reg1_enf_id           BIGINT,
    fecha1_enf            DATE,
    hb1_obs               DECIMAL(4,2),
    hb1_corr              DECIMAL(4,2),
    reg1_med_id           BIGINT,
    fecha1_med            DATE,
    obs1_med              TEXT,
    -- 2do control
    reg2_enf_id           BIGINT,
    fecha2_enf            DATE,
    hb2_obs               DECIMAL(4,2),
    hb2_corr              DECIMAL(4,2),
    reg2_med_id           BIGINT,
    fecha2_med            DATE,
    obs2_med              TEXT,
    -- 3er control
    reg3_enf_id           BIGINT,
    fecha3_enf            DATE,
    hb3_obs               DECIMAL(4,2),
    hb3_corr              DECIMAL(4,2),
    -- cierre
    estado                ENUM('EN_TRATAMIENTO','RECUPERADO','ABANDONO','TRASLADADO') DEFAULT 'EN_TRATAMIENTO',
    observaciones         TEXT,
    es_historico          BOOLEAN NOT NULL DEFAULT FALSE,
    fuente_origen         VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_anem_paciente (paciente_id),
    INDEX idx_anem_reg (registrado_por_id),
    INDEX idx_anem_estado (estado),
    FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    FOREIGN KEY (registrado_por_id) REFERENCES usuario(id),
    FOREIGN KEY (reg1_enf_id) REFERENCES usuario(id),
    FOREIGN KEY (reg1_med_id) REFERENCES usuario(id),
    FOREIGN KEY (reg2_enf_id) REFERENCES usuario(id),
    FOREIGN KEY (reg2_med_id) REFERENCES usuario(id),
    FOREIGN KEY (reg3_enf_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

-- Hoja: CREDMENOR 5
CREATE TABLE cred_menor5 (
    id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
    paciente_id           BIGINT NOT NULL,
    registrado_por_id     BIGINT NOT NULL,
    fecha                 DATE NOT NULL,
    edad_puntual          VARCHAR(20)         COMMENT 'ej: 3M, 1A 2M',
    num_control           TINYINT,
    peso                  DECIMAL(5,2)        COMMENT 'kg',
    talla                 DECIMAL(5,2)        COMMENT 'cm',
    perimetro_cefalico    DECIMAL(5,2)        COMMENT 'cm',
    dx_nutricional        ENUM('GANANCIA_INADECUADA','RECUPERADO','SOBREPESO','DESNUTRICION_AGUDA','DESNUTRICION_CRONICA','NORMAL') NOT NULL,
    lactancia_hasta_6m    BOOLEAN,
    grado_riesgo          VARCHAR(50),
    observaciones         TEXT,
    es_historico          BOOLEAN NOT NULL DEFAULT FALSE,
    fuente_origen         VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cred5_paciente (paciente_id),
    INDEX idx_cred5_reg (registrado_por_id),
    INDEX idx_cred5_fecha (fecha),
    FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    FOREIGN KEY (registrado_por_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

-- Hoja: CRED MAYOR 5 (incluye IMC calculado y guardado)
CREATE TABLE cred_mayor5 (
    id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
    paciente_id           BIGINT NOT NULL,
    registrado_por_id     BIGINT NOT NULL,
    fecha                 DATE NOT NULL,
    edad_puntual          VARCHAR(20),
    num_control           TINYINT,
    peso                  DECIMAL(5,2)        COMMENT 'kg',
    talla                 DECIMAL(5,2)        COMMENT 'metros para IMC',
    imc                   DECIMAL(5,2)        COMMENT '= peso/(talla*talla)',
    riesgo_nutricional    ENUM('BAJO','MEDIO','ALTO'),
    dx_nutricional        ENUM('DESNUTRICION_CRONICA','SOBREPESO','OBESO','NORMAL','RECUPERADO') NOT NULL,
    observaciones         TEXT,
    es_historico          BOOLEAN NOT NULL DEFAULT FALSE,
    fuente_origen         VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_credm_paciente (paciente_id),
    INDEX idx_credm_reg (registrado_por_id),
    INDEX idx_credm_fecha (fecha),
    FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    FOREIGN KEY (registrado_por_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

-- Hoja: PAI <12M
CREATE TABLE pai_menor12m (
    id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
    paciente_id           BIGINT NOT NULL,
    registrado_por_id     BIGINT NOT NULL,
    vacuna_id             BIGINT NOT NULL,
    num_dosis             TINYINT NOT NULL    COMMENT '1, 2 o 3',
    fecha_aplicacion      DATE NOT NULL,
    lote                  VARCHAR(50),
    tipo_aplicacion       ENUM('REGULAR','BARRIDO') DEFAULT 'REGULAR',
    observaciones         TEXT,
    es_historico          BOOLEAN NOT NULL DEFAULT FALSE,
    fuente_origen         VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pai1_paciente (paciente_id),
    INDEX idx_pai1_reg (registrado_por_id),
    INDEX idx_pai1_fecha (fecha_aplicacion),
    FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    FOREIGN KEY (registrado_por_id) REFERENCES usuario(id),
    FOREIGN KEY (vacuna_id) REFERENCES vacuna_catalogo(id)
) ENGINE=InnoDB;

-- Hoja: PAI >12M-<5A
CREATE TABLE pai_12m_5a (
    id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
    paciente_id           BIGINT NOT NULL,
    registrado_por_id     BIGINT NOT NULL,
    vacuna_id             BIGINT NOT NULL,
    num_dosis             TINYINT NOT NULL,
    fecha_aplicacion      DATE NOT NULL,
    lote                  VARCHAR(50),
    tipo_aplicacion       ENUM('REGULAR','BARRIDO') DEFAULT 'REGULAR',
    observaciones         TEXT,
    es_historico          BOOLEAN NOT NULL DEFAULT FALSE,
    fuente_origen         VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pai2_paciente (paciente_id),
    INDEX idx_pai2_reg (registrado_por_id),
    FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    FOREIGN KEY (registrado_por_id) REFERENCES usuario(id),
    FOREIGN KEY (vacuna_id) REFERENCES vacuna_catalogo(id)
) ENGINE=InnoDB;

-- Hoja: PAI >5A
CREATE TABLE pai_mayor5a (
    id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
    paciente_id           BIGINT NOT NULL,
    registrado_por_id     BIGINT NOT NULL,
    vacuna_id             BIGINT NOT NULL,
    num_dosis             TINYINT NOT NULL,
    fecha_aplicacion      DATE NOT NULL,
    lote                  VARCHAR(50),
    tipo_aplicacion       ENUM('REGULAR','BARRIDO') DEFAULT 'REGULAR',
    observaciones         TEXT,
    es_historico          BOOLEAN NOT NULL DEFAULT FALSE,
    fuente_origen         VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pai3_paciente (paciente_id),
    INDEX idx_pai3_reg (registrado_por_id),
    FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    FOREIGN KEY (registrado_por_id) REFERENCES usuario(id),
    FOREIGN KEY (vacuna_id) REFERENCES vacuna_catalogo(id)
) ENGINE=InnoDB;

-- Hoja: PAI>7A-<15A
CREATE TABLE pai_7a_15a (
    id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
    paciente_id           BIGINT NOT NULL,
    registrado_por_id     BIGINT NOT NULL,
    vacuna_id             BIGINT NOT NULL,
    num_dosis             TINYINT NOT NULL,
    fecha_aplicacion      DATE NOT NULL,
    lote                  VARCHAR(50),
    tipo_aplicacion       ENUM('REGULAR','BARRIDO') DEFAULT 'BARRIDO' COMMENT 'niños sin esquema previo',
    observaciones         TEXT,
    es_historico          BOOLEAN NOT NULL DEFAULT FALSE,
    fuente_origen         VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pai4_paciente (paciente_id),
    INDEX idx_pai4_reg (registrado_por_id),
    FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    FOREIGN KEY (registrado_por_id) REFERENCES usuario(id),
    FOREIGN KEY (vacuna_id) REFERENCES vacuna_catalogo(id)
) ENGINE=InnoDB;

-- Hoja: GTE
CREATE TABLE gestante (
    id                        BIGINT PRIMARY KEY AUTO_INCREMENT,
    paciente_id               BIGINT NOT NULL,
    registrado_por_id         BIGINT NOT NULL,
    telefono                  VARCHAR(15),
    -- Influenza (1 dosis en cualquier sem gestacional)
    influenza_fecha           DATE,
    -- Difteria Tetano (3 dosis)
    dt_1_fecha                DATE,
    dt_2_fecha                DATE,
    dt_3_fecha                DATE,
    -- Hepatitis B gestante (3 dosis)
    hepb_1_fecha              DATE,
    hepb_2_fecha              DATE,
    hepb_3_fecha              DATE,
    -- TDPa celular (20-36 sem, 1 mes adelante de DT)
    tdpa_fecha                DATE,
    observaciones             TEXT,
    es_historico              BOOLEAN NOT NULL DEFAULT FALSE,
    fuente_origen             VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_gte_paciente (paciente_id),
    INDEX idx_gte_reg (registrado_por_id),
    FOREIGN KEY (paciente_id) REFERENCES paciente(id),
    FOREIGN KEY (registrado_por_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SEED: usuario MIGRACION + parámetros + catálogos
-- ============================================================

INSERT INTO usuario (id, dni, ap_paterno, ap_materno, nombres, rol, activo, es_sistema, password_hash)
VALUES (1, '00000000', 'MIGRACION', 'HISTORICA', 'SISTEMA', 'SISTEMA', FALSE, TRUE, NULL);

INSERT INTO parametro_sistema (clave, valor, descripcion, tipo_dato) VALUES
('HB_CORRECCION_AYACUCHO', '1.8', 'Corrección Hb por altitud (g/dL)', 'DECIMAL'),
('ESTABLECIMIENTO_NOMBRE', 'CAPI III-M', 'Nombre oficial establecimiento', 'STRING'),
('ESTABLECIMIENTO_UBIGEO', '050101', 'Ubigeo Ayacucho', 'STRING'),
('VERSION_SCHEMA', '1.0.0', 'Versión del esquema BD', 'STRING');

INSERT INTO dx_nutricional_catalogo (codigo, descripcion, grupo_edad) VALUES
('GI',       'Ganancia Inadecuada',    'MENOR_5A'),
('RECUP',    'Recuperado',             'AMBOS'),
('SOBREP',   'Sobrepeso',              'AMBOS'),
('DESN_AG',  'Desnutrición Aguda',     'MENOR_5A'),
('DESN_CR',  'Desnutrición Crónica',   'AMBOS'),
('OBESO',    'Obeso (5 a 17 años)',    'MAYOR_5A'),
('NORMAL',   'Normal',                 'AMBOS');

-- Catálogo vacunas (según Excel; ajustar cuando llegue nueva norma)
INSERT INTO vacuna_catalogo (codigo, nombre, grupo_edad, num_dosis_esquema) VALUES
-- Menor 12M
('PTV',       'Pentavalente',                       'MENOR_12M', 3),
('RTV',       'Rotavirus',                          'MENOR_12M', 3),
('IPV',       'Poliomielitis Inactivada',           'MENOR_12M', 3),
('NEU',       'Neumococo',                          'MENOR_12M', 3),
('INF_PED',   'Influenza Pediátrica',               'MENOR_12M', 2),
-- 12M a 5A
('SPR',       'Sarampión Paperas Rubéola (SPR)',    '12M_5A',    2),
('AMA',       'Antiamarílica',                      '12M_5A',    1),
('DPT_REF',   'DPT Refuerzo',                       '12M_5A',    2),
('VAR',       'Varicela',                           '12M_5A',    1),
-- Mayor 5A
('VPH',       'Virus del Papiloma Humano',          'MAYOR_5A',  2),
-- 7A-15A (barrido)
('HEPB_PED',  'Hepatitis B Pediátrica (barrido)',   '7A_15A',    3),
('DT_ADULTO', 'DT Adulto (barrido)',                '7A_15A',    3),
('PENTA_BAR', 'Pentavalente (barrido hasta 7A)',    '7A_15A',    3),
('DPT_BAR',   'DPT (barrido)',                      '7A_15A',    3),
-- Gestante
('INF_GTE',   'Influenza Gestante',                 'GESTANTE',  1),
('DT_GTE',    'Difteria Tetano Gestante',           'GESTANTE',  3),
('HEPB_GTE',  'Hepatitis B Gestante',               'GESTANTE',  3),
('TDPA',      'TDPa Celular Gestante',              'GESTANTE',  1);

-- ============================================================
-- VISTAS ÚTILES (fase 1)
-- ============================================================

-- Vista: edad calculada de paciente en tiempo real (DATEDIF equivalente)
CREATE OR REPLACE VIEW v_paciente_edad AS
SELECT
    p.id,
    p.dni,
    CONCAT(p.ap_paterno,' ',p.ap_materno,' ',p.nombres) AS nombre_completo,
    p.fecha_nacimiento,
    TIMESTAMPDIFF(YEAR,  p.fecha_nacimiento, CURDATE()) AS edad_anios,
    TIMESTAMPDIFF(MONTH, p.fecha_nacimiento, CURDATE()) % 12 AS edad_meses_resto,
    DATEDIFF(CURDATE(), DATE_ADD(p.fecha_nacimiento,
        INTERVAL TIMESTAMPDIFF(MONTH, p.fecha_nacimiento, CURDATE()) MONTH)) AS edad_dias_resto,
    TIMESTAMPDIFF(MONTH, p.fecha_nacimiento, CURDATE()) AS edad_meses_total,
    p.activo, p.es_historico
FROM paciente p;

-- Vista: pacientes con anemia activa (para llamadas de seguimiento)
CREATE OR REPLACE VIEW v_anemia_pendiente AS
SELECT
    a.id, a.paciente_id,
    CONCAT(p.ap_paterno,' ',p.ap_materno,' ',p.nombres) AS paciente,
    p.telefono, a.fecha_inicio, a.dx_inicial, a.estado,
    GREATEST(
        COALESCE(a.fecha1_enf,'1900-01-01'),
        COALESCE(a.fecha2_enf,'1900-01-01'),
        COALESCE(a.fecha3_enf,'1900-01-01')
    ) AS ultimo_control,
    a.registrado_por_id
FROM anemia_seguimiento a
JOIN paciente p ON p.id = a.paciente_id
WHERE a.estado = 'EN_TRATAMIENTO';

-- Vista: ayuda-memoria vacunas (según Excel + normativa)
CREATE OR REPLACE VIEW v_ayuda_vacunas AS
SELECT grupo_edad, codigo, nombre, num_dosis_esquema
FROM vacuna_catalogo
WHERE activa = TRUE
ORDER BY grupo_edad, codigo;
