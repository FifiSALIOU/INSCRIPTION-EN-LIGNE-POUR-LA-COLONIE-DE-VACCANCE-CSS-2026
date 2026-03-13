-- ============================================================================
-- CRÉATION DE LA TABLE ENFANTS
-- À exécuter dans la base : colonie_css_2026
-- ============================================================================

CREATE TABLE enfants (
  id SERIAL PRIMARY KEY,
  demande_id INT NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  date_naissance DATE NOT NULL,
  sexe sexe_enum NOT NULL,
  lien_parente lien_parente_enum NOT NULL,
  est_titulaire BOOLEAN DEFAULT FALSE,
  position_liste INT,
  liste_attente INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (demande_id) REFERENCES demandes_inscription(id) ON DELETE CASCADE
);

-- Indices pour la table enfants
CREATE INDEX idx_enfants_demande_id ON enfants(demande_id);
CREATE INDEX idx_enfants_date_naissance ON enfants(date_naissance);
CREATE INDEX idx_enfants_est_titulaire ON enfants(est_titulaire);

