-- ============================================================================
-- 2. CRÉATION DE LA TABLE USERS
-- ============================================================================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  prenom VARCHAR(100),
  nom VARCHAR(100),
  role user_role NOT NULL DEFAULT 'parent',
  matricule VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  service VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices pour la table users
CREATE INDEX idx_users_matricule ON users(matricule);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
