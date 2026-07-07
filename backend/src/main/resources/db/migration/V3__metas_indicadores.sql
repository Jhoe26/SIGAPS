-- ============================================================
-- SIGAPS - V3: metas de indicadores por programa (Fase C+D)
-- Valores segun especificacion Figma (95/90/85/80). Pendiente de
-- confirmacion clinica exacta por lic. Maria Elena; ajustables via
-- UPDATE sin requerir despliegue (ya expuestos por GET /api/parametros/{clave}).
-- ============================================================

INSERT INTO parametro_sistema (clave, valor, descripcion, tipo_dato) VALUES
('CRED_META_COBERTURA',       '95', 'Meta cobertura programatica CRED (%)',        'DECIMAL'),
('CRED_META_CONTROLES',       '90', 'Meta controles completos CRED (%)',           'DECIMAL'),
('CRED_META_SEGUIMIENTO',     '85', 'Meta seguimiento oportuno CRED (%)',           'DECIMAL'),
('CRED_META_DETECCION',       '80', 'Meta deteccion temprana CRED (%)',             'DECIMAL'),

('PAI_META_COBERTURA',        '95', 'Meta cobertura programatica PAI (%)',         'DECIMAL'),
('PAI_META_CONTROLES',        '90', 'Meta esquemas completos PAI (%)',             'DECIMAL'),
('PAI_META_SEGUIMIENTO',      '85', 'Meta seguimiento oportuno PAI (%)',            'DECIMAL'),
('PAI_META_DETECCION',        '80', 'Meta deteccion temprana PAI (%)',              'DECIMAL'),

('TAMIZAJE_META_COBERTURA',   '95', 'Meta cobertura programatica Tamizaje (%)',     'DECIMAL'),
('TAMIZAJE_META_CONTROLES',   '90', 'Meta controles completos Tamizaje (%)',        'DECIMAL'),
('TAMIZAJE_META_SEGUIMIENTO', '85', 'Meta seguimiento oportuno Tamizaje (%)',       'DECIMAL'),
('TAMIZAJE_META_DETECCION',   '80', 'Meta deteccion temprana Tamizaje (%)',         'DECIMAL'),

('ANEMIA_META_COBERTURA',     '95', 'Meta cobertura programatica Anemia (%)',      'DECIMAL'),
('ANEMIA_META_CONTROLES',     '90', 'Meta controles completos Anemia (%)',         'DECIMAL'),
('ANEMIA_META_SEGUIMIENTO',   '85', 'Meta seguimiento oportuno Anemia (%)',        'DECIMAL'),
('ANEMIA_META_DETECCION',     '80', 'Meta deteccion temprana Anemia (%)',           'DECIMAL'),

('GESTACIONAL_META_COBERTURA',   '95', 'Meta cobertura programatica Gestacional (%)',   'DECIMAL'),
('GESTACIONAL_META_CONTROLES',   '90', 'Meta controles completos Gestacional (%)',      'DECIMAL'),
('GESTACIONAL_META_SEGUIMIENTO', '85', 'Meta seguimiento oportuno Gestacional (%)',      'DECIMAL'),
('GESTACIONAL_META_DETECCION',   '80', 'Meta deteccion temprana Gestacional (%)',        'DECIMAL');
