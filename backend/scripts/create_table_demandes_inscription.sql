-- ============================================================================
-- CRÉATION DE LA TABLE DEMANDES_INSCRIPTION
-- À exécuter dans la base : colonie_css_2026
-- ============================================================================

CREATE TABLE demandes_inscription (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  statut demande_statut DEFAULT 'en_attente',
  motif_refus TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  validated_at TIMESTAMP,
  validated_by INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indices pour la table demandes_inscription
CREATE INDEX idx_demandes_user_id ON demandes_inscription(user_id);
CREATE INDEX idx_demandes_statut ON demandes_inscription(statut);
CREATE INDEX idx_demandes_validated_by ON demandes_inscription(validated_by);

