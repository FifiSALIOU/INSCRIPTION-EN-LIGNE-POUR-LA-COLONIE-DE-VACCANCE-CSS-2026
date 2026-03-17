import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, UserRole } from "@/types/app";
import { UserPlus, Pencil, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const services = [
  "Direction Générale",
  "Ressources Humaines",
  "Finances et Comptabilité",
  "Prestations Sociales",
  "Recouvrement",
  "Informatique",
  "Service Médical",
  "Affaires Juridiques",
  "Communication",
  "Audit et Contrôle",
];

const Utilisateurs = () => {
  const { users, createUser, updateUser, deleteUser, toggleUserActive } = useAuth();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    matricule: "",
    prenom: "",
    nom: "",
    email: "",
    service: "",
    role: "parent" as UserRole,
    password: "",
  });

  const resetForm = () => {
    setFormData({ matricule: "", prenom: "", nom: "", email: "", service: "", role: "parent", password: "" });
    setEditingUser(null);
  };

  const openCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  const openEdit = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setFormData({
      matricule: user.matricule,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email || "",
      service: user.service,
      role: user.role,
      password: "",
    });
    setEditingUser(userId);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.matricule || !formData.prenom || !formData.nom || !formData.service) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }

    if (editingUser) {
      try {
        await updateUser(editingUser, {
          matricule: formData.matricule,
          prenom: formData.prenom,
          nom: formData.nom,
          email: formData.email,
          service: formData.service,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {}),
        });
        toast({ title: "Utilisateur modifié", description: `${formData.prenom} ${formData.nom} a été mis à jour.` });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'utilisateur.";
        toast({ title: "Erreur", description: message, variant: "destructive" });
        return;
      }
    } else {
      if (!formData.password) {
        toast({ title: "Erreur", description: "Le mot de passe est requis pour un nouvel utilisateur.", variant: "destructive" });
        return;
      }
      const result = await createUser({
        matricule: formData.matricule,
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        service: formData.service,
        role: formData.role,
        password: formData.password,
      });
      if (!result.ok) {
        toast({ title: "Erreur", description: result.message, variant: "destructive" });
        return;
      }
      toast({ title: "Utilisateur créé", description: result.message });
    }

    setShowDialog(false);
    resetForm();
  };

  const handleDelete = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    if (!confirm(`Supprimer l'utilisateur ${user.prenom} ${user.nom} ?`)) return;
    try {
      await deleteUser(userId);
      toast({ title: "Utilisateur supprimé", description: `${user.prenom} ${user.nom} a été supprimé.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression de l'utilisateur.";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (userId: string) => {
    await toggleUserActive(userId);
    const user = users.find((u) => u.id === userId);
    toast({ title: user?.isActive === false ? "Utilisateur activé" : "Utilisateur désactivé" });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Créer, modifier, supprimer et gérer les comptes.</p>
        </div>
        <Button onClick={openCreate} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <UserPlus className="w-4 h-4 mr-2" /> Nouvel utilisateur
        </Button>
      </motion.div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Utilisateurs enregistrés ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                  <TableHead className="text-primary-foreground font-bold text-xs uppercase tracking-wider">Matricule</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs uppercase tracking-wider">Nom complet</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs uppercase tracking-wider">Email</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs uppercase tracking-wider">Service</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs uppercase tracking-wider">Rôle</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs uppercase tracking-wider">Statut</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-xs uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className={`hover:bg-muted/50 ${user.isActive === false ? "opacity-50" : ""}`}>
                    <TableCell className="font-mono text-xs">{user.matricule}</TableCell>
                    <TableCell className="text-sm font-medium">{user.nom} {user.prenom}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email || "—"}</TableCell>
                    <TableCell className="text-sm">{user.service}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{ROLE_LABELS[user.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.isActive !== false}
                          onCheckedChange={() => handleToggleActive(user.id)}
                        />
                        <span className="text-xs">{user.isActive !== false ? "Actif" : "Inactif"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(user.id)} className="h-8 px-2">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(user.id)} className="h-8 px-2 border-destructive text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Matricule *</Label>
                <Input value={formData.matricule} onChange={(e) => setFormData((p) => ({ ...p, matricule: e.target.value }))} placeholder="CSS-XXXX" />
              </div>
              <div className="space-y-1.5">
                <Label>Rôle *</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData((p) => ({ ...p, role: val as UserRole }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent / Agent CSS</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="super_admin">Super Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Prénom *</Label>
                <Input value={formData.prenom} onChange={(e) => setFormData((p) => ({ ...p, prenom: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Nom *</Label>
                <Input value={formData.nom} onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Service *</Label>
              <Select value={formData.service} onValueChange={(val) => setFormData((p) => ({ ...p, service: val }))}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{editingUser ? "Nouveau mot de passe (laisser vide pour garder)" : "Mot de passe *"}</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button onClick={handleSubmit} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              {editingUser ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Utilisateurs;
