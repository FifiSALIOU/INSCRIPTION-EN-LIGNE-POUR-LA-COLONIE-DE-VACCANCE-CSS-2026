from datetime import date, datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum as SqlEnum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    PARENT = "PARENT"
    GESTIONNAIRE = "GESTIONNAIRE"


class LienParente(str, Enum):
    PERE = "PERE"
    MERE = "MERE"
    TUTEUR_LEGAL = "TUTEUR_LEGAL"
    AUTRE = "AUTRE"


class TypeListe(str, Enum):
    PRINCIPALE = "PRINCIPALE"
    ATTENTE_1 = "ATTENTE_1"
    ATTENTE_2 = "ATTENTE_2"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(SqlEnum(UserRole), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    parent: Mapped["Parent"] = relationship(back_populates="user", uselist=False)


class Parent(Base):
    __tablename__ = "parents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    matricule_css: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    prenom: Mapped[str] = mapped_column(String(100), nullable=False)
    nom: Mapped[str] = mapped_column(String(100), nullable=False)
    service: Mapped[str | None] = mapped_column(String(150), nullable=True)

    user: Mapped[User] = relationship(back_populates="parent")
    demandes: Mapped[list["Demande"]] = relationship(back_populates="parent")


class SessionColonie(Base):
    __tablename__ = "sessions_colonie"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    annee: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)

    # bornes de dates de naissance autorisées pour cette session
    date_naissance_min: Mapped[date] = mapped_column(Date, nullable=False)
    date_naissance_max: Mapped[date] = mapped_column(Date, nullable=False)

    demandes: Mapped[list["Demande"]] = relationship(back_populates="session")


class DemandeStatut(str, Enum):
    BROUILLON = "BROUILLON"
    EN_ATTENTE = "EN_ATTENTE"
    VALIDEE = "VALIDEE"
    REFUSEE = "REFUSEE"


class Demande(Base):
    __tablename__ = "demandes"
    __table_args__ = (
        UniqueConstraint(
            "parent_id",
            "session_id",
            name="uq_demande_parent_session",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    parent_id: Mapped[int] = mapped_column(
        ForeignKey("parents.id", ondelete="CASCADE"), nullable=False
    )
    session_id: Mapped[int] = mapped_column(
        ForeignKey("sessions_colonie.id", ondelete="RESTRICT"), nullable=False
    )

    statut: Mapped[DemandeStatut] = mapped_column(
        SqlEnum(DemandeStatut), nullable=False, default=DemandeStatut.BROUILLON
    )
    motif_refus: Mapped[str | None] = mapped_column(String(500), nullable=True)

    date_envoi_validation: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    date_validation: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    date_refus: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    validated_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    parent: Mapped[Parent] = relationship(back_populates="demandes")
    session: Mapped[SessionColonie] = relationship(back_populates="demandes")
    enfants: Mapped[list["Enfant"]] = relationship(back_populates="demande")


class Enfant(Base):
    __tablename__ = "enfants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    demande_id: Mapped[int] = mapped_column(
        ForeignKey("demandes.id", ondelete="CASCADE"), nullable=False, index=True
    )

    prenom: Mapped[str] = mapped_column(String(100), nullable=False)
    nom: Mapped[str] = mapped_column(String(100), nullable=False)
    date_naissance: Mapped[date] = mapped_column(Date, nullable=False)
    sexe: Mapped[str] = mapped_column(String(10), nullable=False)  # ex: "M" / "F"

    lien_parente: Mapped[LienParente] = mapped_column(SqlEnum(LienParente), nullable=False)

    # vrai si le parent a coché "Titulaire" pour cet enfant
    is_titulaire: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # type de liste calculé côté métier : PRINCIPALE, ATTENTE_1, ATTENTE_2
    type_liste: Mapped[TypeListe | None] = mapped_column(
        SqlEnum(TypeListe), nullable=True
    )

    demande: Mapped[Demande] = relationship(back_populates="enfants")

    __table_args__ = (
        CheckConstraint("sexe IN ('M', 'F')", name="ck_enfant_sexe"),
    )

