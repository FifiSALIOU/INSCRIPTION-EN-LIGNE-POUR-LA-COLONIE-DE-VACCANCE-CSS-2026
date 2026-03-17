import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppUser, ROLE_LABELS, UserRole } from "@/types/app";
import { apiRequest, getToken, removeToken, setToken } from "@/lib/api";

const USERS_STORAGE_KEY = "css_colonie_users_v1";
const SESSION_STORAGE_KEY = "css_colonie_session_user_id_v1";

const seedUsers: AppUser[] = [
  {
    id: "usr-parent-001",
    role: "parent",
    matricule: "PARENT001",
    prenom: "Amina",
    nom: "Hassan",
    email: "amina.hassan@css.dj",
    service: "Prestations Sociales",
    password: "Parent123!",
    isActive: true,
  },
  {
    id: "usr-admin-001",
    role: "admin",
    matricule: "ADMIN001",
    prenom: "Youssouf",
    nom: "Ali",
    email: "youssouf.ali@css.dj",
    service: "Administration",
    password: "Admin123!",
    isActive: true,
  },
  {
    id: "usr-super-001",
    role: "super_admin",
    matricule: "SUPER001",
    prenom: "Salma",
    nom: "Ibrahim",
    email: "salma.ibrahim@css.dj",
    service: "Direction Générale",
    password: "Super123!",
    isActive: true,
  },
];

function backendRoleToFrontend(role: string): UserRole {
  if (role === "parent") return "parent";
  if (role === "gestionnaire") return "admin";
  if (role === "admin") return "super_admin";
  return "parent";
}

function userReadToAppUser(u: { id: number; role: string; matricule: string; prenom?: string | null; nom?: string | null; email?: string | null; service?: string | null; is_active: boolean }): AppUser {
  return {
    id: String(u.id),
    role: backendRoleToFrontend(u.role),
    matricule: u.matricule,
    prenom: u.prenom ?? "",
    nom: u.nom ?? "",
    email: u.email ?? undefined,
    service: u.service ?? "",
    password: "",
    isActive: u.is_active,
  };
}

const normalizeMatricule = (value: string) => value.trim().toUpperCase();

/** Pour le login : matricule en majuscules, email inchangé (sensible à la casse). */
const loginIdentifiant = (value: string) => {
  const trimmed = value.trim();
  return trimmed.includes("@") ? trimmed : trimmed.toUpperCase();
};

const readUsers = (): AppUser[] => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) return seedUsers;
  try {
    const parsed = JSON.parse(stored) as AppUser[];
    return parsed.length > 0 ? parsed : seedUsers;
  } catch {
    return seedUsers;
  }
};

interface RegisterParentInput {
  matricule: string;
  prenom: string;
  nom: string;
  email?: string;
  service: string;
  password: string;
}

interface CreateUserInput {
  matricule: string;
  prenom: string;
  nom: string;
  email?: string;
  service: string;
  role: UserRole;
  password: string;
}

interface AuthContextValue {
  users: AppUser[];
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  login: (identifiant: string, password?: string, mode?: "parent" | "admin") => Promise<{ ok: boolean; message: string; role?: UserRole }>;
  logout: () => void;
  registerParent: (input: RegisterParentInput) => Promise<{ ok: boolean; message: string }>;
  createUser: (input: CreateUserInput) => Promise<{ ok: boolean; message: string }>;
  updateUser: (id: string, data: Partial<Omit<AppUser, "id">>) => void;
  deleteUser: (id: string) => void;
  toggleUserActive: (id: string) => Promise<void>;
  refetchUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<AppUser[]>(readUsers);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => localStorage.getItem(SESSION_STORAGE_KEY));

  const refetchUsers = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const { data } = await apiRequest<unknown[]>("/admin/users", { method: "GET" });
    if (data && Array.isArray(data)) {
      setUsers(data.map((u: Record<string, unknown>) => userReadToAppUser(u as Parameters<typeof userReadToAppUser>[0])));
    }
  }, []);

  useEffect(() => {
    if (!sessionUserId) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setCurrentUser(null);
      return;
    }
    localStorage.setItem(SESSION_STORAGE_KEY, sessionUserId);
    const fromLocal = users.find((u) => u.id === sessionUserId);
    if (fromLocal) setCurrentUser(fromLocal);
  }, [sessionUserId, users]);

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) return;
      const { data, error } = await apiRequest<Parameters<typeof userReadToAppUser>[0]>("/me", { method: "GET" });
      if (error || !data) {
        removeToken();
        setSessionUserId(null);
        return;
      }
      const appUser = userReadToAppUser(data);
      setCurrentUser(appUser);
      setSessionUserId(appUser.id);
    })();
  }, []);

  useEffect(() => {
    if (currentUser && (currentUser.role === "admin" || currentUser.role === "super_admin")) {
      refetchUsers();
    }
  }, [currentUser?.id, currentUser?.role]);

  const login = useCallback(
    async (identifiant: string, password?: string, mode: "parent" | "admin" = "admin") => {
      let tokenData: { access_token: string } | null = null;
      let error: string | null = null;

      if (mode === "parent") {
        const body = {
          matricule: loginIdentifiant(identifiant),
        };
        const response = await apiRequest<{ access_token: string }>("/auth/login-parent", {
          method: "POST",
          body: JSON.stringify(body),
        });
        tokenData = response.data ?? null;
        error = response.error ?? null;
      } else {
        const form = new FormData();
        form.append("username", loginIdentifiant(identifiant));
        form.append("password", password ?? "");
        const response = await apiRequest<{ access_token: string }>("/auth/login", {
          method: "POST",
          body: form,
        });
        tokenData = response.data ?? null;
        error = response.error ?? null;
      }

      if (error || !tokenData?.access_token) {
        return { ok: false, message: error ?? "Identifiants incorrects." };
      }

      setToken(tokenData.access_token);
      const { data: meData, error: meError } = await apiRequest<Parameters<typeof userReadToAppUser>[0]>("/me", { method: "GET" });
      if (meError || !meData) {
        removeToken();
        return { ok: false, message: "Erreur lors de la récupération du profil." };
      }
      const appUser = userReadToAppUser(meData);
      if (!appUser.isActive) {
        removeToken();
        return { ok: false, message: "Ce compte est désactivé. Contactez l'administrateur." };
      }
      setCurrentUser(appUser);
      setSessionUserId(appUser.id);
      return { ok: true, message: `Connexion réussie (${ROLE_LABELS[appUser.role]}).`, role: appUser.role };
    },
    [],
  );

  const logout = useCallback(() => {
    removeToken();
    setSessionUserId(null);
    setCurrentUser(null);
  }, []);

  const registerParent = useCallback(async (input: RegisterParentInput) => {
    const body = {
      matricule: normalizeMatricule(input.matricule),
      prenom: input.prenom.trim(),
      nom: input.nom.trim(),
      email: input.email?.trim() || null,
      service: input.service.trim(),
      password: input.password,
      role: "parent",
    };
    const { error } = await apiRequest("/users", { method: "POST", body: JSON.stringify(body) });
    if (error) return { ok: false, message: error };
    return { ok: true, message: "Compte parent créé avec succès." };
  }, []);

  const createUser = useCallback(async (input: CreateUserInput) => {
    const roleMap: Record<UserRole, string> = { parent: "parent", admin: "gestionnaire", super_admin: "admin" };
    const body = {
      matricule: normalizeMatricule(input.matricule),
      prenom: input.prenom.trim(),
      nom: input.nom.trim(),
      email: input.email?.trim() || null,
      service: input.service.trim(),
      password: input.password,
      role: roleMap[input.role],
    };
    const { error } = await apiRequest("/admin/users", { method: "POST", body: JSON.stringify(body) });
    if (error) return { ok: false, message: error };
    await refetchUsers();
    return { ok: true, message: `Utilisateur ${input.prenom} ${input.nom} créé avec succès.` };
  }, [refetchUsers]);

  const updateUser = useCallback((id: string, data: Partial<Omit<AppUser, "id">>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const toggleUserActive = useCallback(async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const next = !user.isActive;
    const { error } = await apiRequest(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: next }),
    });
    if (error) return;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: next } : u)));
    if (currentUser?.id === id) setCurrentUser((u) => (u ? { ...u, isActive: next } : null));
  }, [users, currentUser?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      users,
      currentUser: currentUser ?? (sessionUserId ? users.find((u) => u.id === sessionUserId) ?? null : null),
      isAuthenticated: Boolean(currentUser ?? (sessionUserId && users.find((u) => u.id === sessionUserId))),
      login,
      logout,
      registerParent,
      createUser,
      updateUser,
      deleteUser,
      toggleUserActive,
      refetchUsers,
    }),
    [users, currentUser, sessionUserId, login, logout, registerParent, createUser, updateUser, deleteUser, toggleUserActive, refetchUsers],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider.");
  return context;
};
