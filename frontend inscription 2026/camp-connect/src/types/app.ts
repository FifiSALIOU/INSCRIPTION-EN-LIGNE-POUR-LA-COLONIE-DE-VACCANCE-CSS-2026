export type UserRole = "parent" | "admin" | "super_admin";

export type ChildSex = "masculin" | "feminin";
export type ParentRelation = "pere" | "mere" | "tuteur_legal" | "autre";

export type ListType = "principale" | "attente_1" | "attente_2";
export type InscriptionStatus = "en_attente" | "validee" | "refusee";

export interface AppUser {
  id: string;
  role: UserRole;
  matricule: string;
  prenom: string;
  nom: string;
  email?: string;
  service: string;
  password: string;
  isActive?: boolean;
}

export interface Inscription {
  id: string;
  parentUserId: string;
  parentMatricule: string;
  parentPrenom: string;
  parentNom: string;
  parentService: string;
  childPrenom: string;
  childNom: string;
  childBirthDate: string;
  childSex: ChildSex;
  childRelation: ParentRelation;
  isTitulaire: boolean;
  listType: ListType;
  status: InscriptionStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  parent: "Parent / Agent CSS",
  admin: "Administrateur",
  super_admin: "Super Administrateur",
};

export const LIST_LABELS: Record<ListType, string> = {
  principale: "Liste principale",
  attente_1: "Liste d'attente N°1",
  attente_2: "Liste d'attente N°2",
};

export const STATUS_LABELS: Record<InscriptionStatus, string> = {
  en_attente: "En attente",
  validee: "Validée",
  refusee: "Refusée",
};

export const RELATION_LABELS: Record<ParentRelation, string> = {
  pere: "Père",
  mere: "Mère",
  tuteur_legal: "Tuteur légal",
  autre: "Autre",
};

export const STATUS_BADGE_CLASS: Record<InscriptionStatus, string> = {
  en_attente: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/10 hover:text-warning hover:border-warning/20",
  validee: "bg-success/10 text-success border-success/20 hover:bg-success/10 hover:text-success hover:border-success/20",
  refusee: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20",
};
