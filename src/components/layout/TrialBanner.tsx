import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";

export function TrialBanner() {
  const { status, trialEndsAt } = useSubscription();
  const navigate = useNavigate();

  if (status !== "trial" || !trialEndsAt) return null;

  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / msPerDay));

  let message = `Você está no teste gratuito. Restam ${days} dias.`;
  let tone = "bg-secondary/40 border-border text-foreground";

  if (days <= 3) {
    message = `Seu acesso termina em ${days} ${days === 1 ? "dia" : "dias"}. Garanta sua continuidade.`;
    tone = "bg-destructive/10 border-destructive/40 text-foreground";
  } else if (days <= 7) {
    message = `Seu teste termina em ${days} dias. Não perca seus dados.`;
    tone = "bg-primary/10 border-primary/40 text-foreground";
  }

  return (
    <div className={`flex items-center gap-3 border-b px-6 py-2 text-sm ${tone}`}>
      <Sparkles className="h-4 w-4 text-primary shrink-0" />
      <span className="flex-1">{message}</span>
      <Button size="sm" variant="outline" onClick={() => navigate("/settings")}>
        Ativar assinatura
      </Button>
    </div>
  );
}
