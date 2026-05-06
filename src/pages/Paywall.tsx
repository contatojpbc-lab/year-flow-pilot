import { Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Paywall() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/landing", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Seu período gratuito terminou
            </h1>
            <p className="text-muted-foreground">
              Para continuar usando o sistema e manter seus dados, ative sua assinatura.
            </p>
          </div>
          <div className="space-y-2">
            <Button
              size="lg"
              className="w-full"
              onClick={() => toast.info("Assinatura em breve. Estamos preparando os planos.")}
            >
              Assinar agora
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair da conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
