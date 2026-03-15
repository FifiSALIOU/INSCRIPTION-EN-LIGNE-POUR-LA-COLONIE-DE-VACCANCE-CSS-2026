import { motion } from "framer-motion";
import { Baby, ClipboardCheck, Clock, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useInscriptions } from "@/context/InscriptionsContext";
import { LIST_LABELS, STATUS_BADGE_CLASS, STATUS_LABELS } from "@/types/app";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getParentInscriptions } = useInscriptions();

  // Redirect non-parents to their dashboards
  if (currentUser?.role === "admin") {
    navigate("/dashboard/admin", { replace: true });
    return null;
  }
  if (currentUser?.role === "super_admin") {
    navigate("/dashboard/super-admin", { replace: true });
    return null;
  }

  const myInscriptions = currentUser ? getParentInscriptions(currentUser.id) : [];
  const validated = myInscriptions.filter((i) => i.status === "validee").length;
  const pending = myInscriptions.filter((i) => i.status === "en_attente").length;

  const stats = [
    { label: "Enfants inscrits", value: myInscriptions.length, icon: Baby, color: "text-secondary" },
    { label: "Validées", value: validated, icon: ClipboardCheck, color: "text-success" },
    { label: "En attente", value: pending, icon: Clock, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Bonjour, {currentUser?.prenom} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Bienvenue sur votre espace Colonie de Vacances 2026</p>
        </div>
        <Button onClick={() => navigate("/dashboard/inscrire")} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/20">
          <Plus className="w-4 h-4 mr-2" />
          Inscrire un enfant
        </Button>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card hover:shadow-xl transition-shadow">
              <CardContent className="p-4 lg:p-5">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <span className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</span>
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-display">Mes dernières inscriptions</CardTitle>
            <Button variant="ghost" size="sm" className="text-secondary" onClick={() => navigate("/dashboard/inscriptions")}>
              Tout voir
            </Button>
          </CardHeader>
          <CardContent>
            {myInscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Vous n'avez pas encore inscrit d'enfant.</p>
            ) : (
              <div className="space-y-3">
                {myInscriptions.slice(0, 5).map((ins) => (
                  <div key={ins.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Baby className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{ins.childNom} {ins.childPrenom}</p>
                        <p className="text-xs text-muted-foreground">{new Date(ins.childBirthDate).toLocaleDateString("fr-FR")} {ins.isTitulaire && "• Titulaire"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{LIST_LABELS[ins.listType]}</Badge>
                      <Badge className={`text-xs ${STATUS_BADGE_CLASS[ins.status]}`}>{STATUS_LABELS[ins.status]}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
