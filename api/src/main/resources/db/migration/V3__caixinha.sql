CREATE TABLE caixinha (
    id UUID PRIMARY KEY,
    grupo_id UUID NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    type VARCHAR(40) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_caixinha_grupo ON caixinha(grupo_id);
