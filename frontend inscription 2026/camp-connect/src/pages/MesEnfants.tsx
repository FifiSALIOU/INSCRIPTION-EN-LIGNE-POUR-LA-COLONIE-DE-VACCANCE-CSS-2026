import { motion } from "framer-motion";
import { Baby, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useInscriptions } from "@/context/InscriptionsContext";
import { LIST_LABELS, RELATION_LABELS, STATUS_BADGE_CLASS, STATUS_LABELS } from "@/types/app";

const MesEnfants = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getParentInscriptions } = useInscriptions();

  const myInscriptions = currentUser ? getParentInscriptions(currentUser.id) : [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Mes enfants</h1>
          <p className="text-muted-foreground mt-1">Enfants inscrits à la colonie 2026</p>
        </div>
        <Button onClick={() => navigate("/dashboard/inscrire")} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Inscrire
        </Button>
      </motion.div>

      {myInscriptions.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Baby className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun enfant inscrit pour le moment.</p>
            <Button onClick={() => navigate("/dashboard/inscrire")} className="mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              Inscrire mon premier enfant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myInscriptions.map((ins, i) => (
            <motion.div key={ins.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}>
              <Card className="glass-card hover:shadow-xl transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Baby className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {ins.isTitulaire && (
                        <Badge className="bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/20 text-xs">
                          Enfant titulaire
                        </Badge>
                      )}
                      <Badge className={`text-xs ${STATUS_BADGE_CLASS[ins.status]}`}>{STATUS_LABELS[ins.status]}</Badge>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">{ins.childNom} {ins.childPrenom}</h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>Né(e) le {new Date(ins.childBirthDate).toLocaleDateString("fr-FR")} • {ins.childSex === "masculin" ? "Garçon" : "Fille"}</p>
                    <p>Lien : {RELATION_LABELS[ins.childRelation]}</p>
                    <p>Liste : {LIST_LABELS[ins.listType]}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesEnfants;
