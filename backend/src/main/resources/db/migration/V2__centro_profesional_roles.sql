-- ============================================================
-- SIGAPS - V2: centro_salud, profesional, roles nuevos,
-- separacion profesional_id (quien atendio) vs registrado_por_id (quien registro)
-- ============================================================

CREATE TABLE centro_salud (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre        VARCHAR(150) NOT NULL,
    ubigeo        VARCHAR(10),
    direccion     VARCHAR(200),
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO centro_salud (nombre, ubigeo, direccion)
VALUES ('CAPI III-M', '050101', 'Ayacucho');

CREATE TABLE profesional (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    dni           CHAR(8) NOT NULL UNIQUE,
    nombres       VARCHAR(80) NOT NULL,
    ap_paterno    VARCHAR(60) NOT NULL,
    ap_materno    VARCHAR(60) NOT NULL,
    especialidad  VARCHAR(80),
    colegiatura   VARCHAR(20),
    tipo_colegio  VARCHAR(20)         COMMENT 'CEP/CMP/COP/etc, sin restriccion rigida',
    centro_id     BIGINT,
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_profesional_dni (dni),
    FOREIGN KEY (centro_id) REFERENCES centro_salud(id)
) ENGINE=InnoDB;

-- usuario: centro asignado, ultimo acceso, roles SUPERVISOR/OBSTETRA
ALTER TABLE usuario
    ADD COLUMN centro_id BIGINT NULL AFTER es_sistema,
    ADD COLUMN ultimo_acceso TIMESTAMP NULL AFTER centro_id,
    ADD CONSTRAINT fk_usuario_centro FOREIGN KEY (centro_id) REFERENCES centro_salud(id);

ALTER TABLE usuario
    MODIFY COLUMN rol ENUM('ENFERMERA','MEDICO','ADMIN','SISTEMA','SUPERVISOR','OBSTETRA') NOT NULL;

-- registros clinicos: profesional_id (quien atendio) separado de registrado_por_id (quien tecleo).
-- Nullable: los registros ya existentes y la migracion Excel futura no siempre traen este dato.
ALTER TABLE tamizaje_hb
    ADD COLUMN profesional_id BIGINT NULL AFTER registrado_por_id,
    ADD CONSTRAINT fk_tamizaje_profesional FOREIGN KEY (profesional_id) REFERENCES profesional(id);

ALTER TABLE cred_menor5
    ADD COLUMN profesional_id BIGINT NULL AFTER registrado_por_id,
    ADD CONSTRAINT fk_credmenor5_profesional FOREIGN KEY (profesional_id) REFERENCES profesional(id);

ALTER TABLE cred_mayor5
    ADD COLUMN profesional_id BIGINT NULL AFTER registrado_por_id,
    ADD CONSTRAINT fk_credmayor5_profesional FOREIGN KEY (profesional_id) REFERENCES profesional(id);

ALTER TABLE anemia_seguimiento
    ADD COLUMN profesional_id BIGINT NULL AFTER registrado_por_id,
    ADD CONSTRAINT fk_anemia_profesional FOREIGN KEY (profesional_id) REFERENCES profesional(id);

ALTER TABLE pai_menor12m
    ADD COLUMN profesional_id BIGINT NULL AFTER registrado_por_id,
    ADD CONSTRAINT fk_pai1_profesional FOREIGN KEY (profesional_id) REFERENCES profesional(id);

ALTER TABLE pai_12m_5a
    ADD COLUMN profesional_id BIGINT NULL AFTER registrado_por_id,
    ADD CONSTRAINT fk_pai2_profesional FOREIGN KEY (profesional_id) REFERENCES profesional(id);

ALTER TABLE pai_mayor5a
    ADD COLUMN profesional_id BIGINT NULL AFTER registrado_por_id,
    ADD CONSTRAINT fk_pai3_profesional FOREIGN KEY (profesional_id) REFERENCES profesional(id);

ALTER TABLE pai_7a_15a
    ADD COLUMN profesional_id BIGINT NULL AFTER registrado_por_id,
    ADD CONSTRAINT fk_pai4_profesional FOREIGN KEY (profesional_id) REFERENCES profesional(id);

ALTER TABLE gestante
    ADD COLUMN profesional_id BIGINT NULL AFTER registrado_por_id,
    ADD CONSTRAINT fk_gestante_profesional FOREIGN KEY (profesional_id) REFERENCES profesional(id);
