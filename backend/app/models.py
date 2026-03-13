from datetime import date, datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum as SqlEnum,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class UserRole(str, Enum):
    PARENT = "parent"
    GESTIONNAIRE = "gestionnaire"
    ADMIN = "admin"


class SexeEnum(str, Enum):
    MASCULIN = "M"
    FEMININ = "F"


class LienParenteEnum(str, Enum):
    PERE = "Pere"
    MERE = "Mere"
    TUTEUR_LEGAL = "Tuteur_legal"
    AUTRE = "Autre"


class DemandeStatut(str, Enum):
    EN_ATTENTE = "en_attente"
    VALIDEE = "validee"
    REJETEE = "rejetee"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    prenom: Mapped[str | None] = mapped_column(String(100), nullable=True)
    nom: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # IMPORTANT :
    # - Le type PostgreSQL "user_role" contient les valeurs en MINUSCULE
    #   ('parent', 'gestionnaire', 'admin').
    # - On demande donc à SQLAlchemy d'utiliser les .value de l'enum Python
    #   (parent, gestionnaire, admin) au lieu des .name (PARENT, GESTIONNAIRE, ADMIN),
    #   sinon PostgreSQL reçoit "PARENT" et lève l'erreur :
    #   "valeur en entrée invalide pour le enum user_role : « PARENT »".
    role: Mapped[UserRole] = mapped_column(
        SqlEnum(
            UserRole,
            name="user_role",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        nullable=False,
        default=UserRole.PARENT,
    )
    matricule: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    service: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)

    demandes: Mapped[list["DemandeInscription"]] = relationship(
        "DemandeInscription",
        back_populates="user",
        foreign_keys="DemandeInscription.user_id",
    )


class DemandeInscription(Base):
    __tablename__ = "demandes_inscription"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # Même logique que pour user_role :
    # le type PostgreSQL "demande_statut" contient des valeurs en minuscules
    # ('en_attente', 'validee', 'rejetee'), donc on force l'utilisation
    # des .value de l'enum DemandeStatut.
    statut: Mapped[DemandeStatut] = mapped_column(
        SqlEnum(
            DemandeStatut,
            name="demande_statut",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        default=DemandeStatut.EN_ATTENTE,
        nullable=True,
    )
    motif_refus: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    validated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)

    validated_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    user: Mapped[User] = relationship("User", back_populates="demandes", foreign_keys=[user_id])
    valideur: Mapped[User | None] = relationship("User", foreign_keys=[validated_by])
    enfants: Mapped[list["Enfant"]] = relationship(
        "Enfant", back_populates="demande", cascade="all, delete-orphan"
    )


class Enfant(Base):
    __tablename__ = "enfants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    demande_id: Mapped[int] = mapped_column(
        ForeignKey("demandes_inscription.id", ondelete="CASCADE"), nullable=False, index=True
    )

    prenom: Mapped[str] = mapped_column(String(100), nullable=False)
    nom: Mapped[str] = mapped_column(String(100), nullable=False)
    date_naissance: Mapped[date] = mapped_column(Date, nullable=False)

    # Comme pour les autres enums, les types PostgreSQL "sexe_enum" et
    # "lien_parente_enum" stockent les VALEURS de l'enum Python :
    # - SexeEnum.MASCULIN.value = "M"
    # - SexeEnum.FEMININ.value = "F"
    # - LienParenteEnum.PERE.value = "Pere", etc.
    # On force donc l'utilisation de e.value pour éviter d'envoyer
    # "MASCULIN" / "PERE" à PostgreSQL.
    sexe: Mapped[SexeEnum] = mapped_column(
        SqlEnum(
            SexeEnum,
            name="sexe_enum",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        nullable=False,
    )
    lien_parente: Mapped[LienParenteEnum] = mapped_column(
        SqlEnum(
            LienParenteEnum,
            name="lien_parente_enum",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        nullable=False,
    )

    est_titulaire: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    position_liste: Mapped[int | None] = mapped_column(Integer, nullable=True)
    liste_attente: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)

    demande: Mapped[DemandeInscription] = relationship(
        "DemandeInscription", back_populates="enfants"
    )

