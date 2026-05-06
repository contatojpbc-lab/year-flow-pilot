import { useState } from "react";
import { User, Palette, Bell, Database, LogOut, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLifeAreas } from "@/contexts/LifeAreasContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Settings = () => {
  const { user, profile, signOut } = useAuth();
  const { lifeAreas, refresh: refreshAreas } = useLifeAreas();
  const navigate = useNavigate();
  const [clearing, setClearing] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const handleClearSampleData = async () => {
    if (!user) return;
    setClearing(true);
    const tables = [
      "goal_contributions", "milestones", "habit_entries", "mvd_check_ins",
      "transactions", "journal_entries", "reminders", "weekly_reviews",
      "monthly_snapshots", "goals", "routine_items", "mvd_items",
      "expense_categories", "financial_plans", "financial_goals", "life_areas",
    ] as const;
    try {
      for (const t of tables) {
        await supabase.from(t).delete().eq("user_id", user.id);
      }
      await refreshAreas();
      toast.success("Dados de exemplo removidos. Comece do zero quando quiser.");
    } catch {
      toast.error("Não foi possível limpar os dados agora. Tente novamente.");
    } finally {
      setClearing(false);
    }
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Usuário";
  const email = user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Perfil</CardTitle>
          </div>
          <CardDescription>Suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {initial}
            </div>
            <div>
              <p className="font-medium text-foreground">{displayName}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Editar perfil</Button>
        </CardContent>
      </Card>

      {/* Life Areas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Áreas da Vida</CardTitle>
          </div>
          <CardDescription>Personalize as áreas usadas no acompanhamento de metas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lifeAreas.map((area) => (
              <div 
                key={area.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: area.color }}
                  />
                  <span className="text-sm font-medium text-foreground">{area.name}</span>
                </div>
                <Button variant="ghost" size="sm">Editar</Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            Adicionar área
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Notificações</CardTitle>
          </div>
          <CardDescription>Configure como você recebe lembretes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Notificações no navegador</p>
              <p className="text-xs text-muted-foreground">Receba avisos diretamente no navegador</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Lembretes por email</p>
              <p className="text-xs text-muted-foreground">Resumo diário e lembretes</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Lembrete da revisão semanal</p>
              <p className="text-xs text-muted-foreground">Aviso para completar sua revisão da semana</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Dados e privacidade</CardTitle>
          </div>
          <CardDescription>Seus dados ficam isolados na sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" size="sm">Exportar meus dados</Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar dados de exemplo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar todos os dados?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso vai apagar metas, hábitos, finanças, diário e demais registros desta conta.
                  Use para começar do zero. Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={clearing}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearSampleData} disabled={clearing}>
                  {clearing ? "Limpando..." : "Sim, limpar tudo"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-destructive/30">
        <CardContent className="p-4">
          <Button onClick={handleSignOut} variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4 mr-2" />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
