import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Target, Calendar, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  {
    icon: Sparkles,
    title: "Bem-vindo ao Life OS",
    desc: "Este é seu sistema operacional pessoal. Em poucos minutos por dia, você acompanha metas, hábitos, finanças e evolução em um só lugar.",
  },
  {
    icon: Target,
    title: "Defina suas metas",
    desc: "Comece criando metas SMART nas suas Áreas da Vida. Cada meta é acompanhada com progresso real ao longo do ano.",
  },
  {
    icon: Calendar,
    title: "Construa sua rotina",
    desc: "Adicione hábitos diários e marque seu Mínimo Viável Diário. Pequenas vitórias todos os dias geram grandes resultados.",
  },
  {
    icon: CheckCircle2,
    title: "Tudo pronto!",
    desc: "Seus dados são privados e ficam isolados na sua conta. A qualquer momento você pode voltar para as Configurações para personalizar.",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  const finish = () => {
    if (user) localStorage.setItem(`onboarding_done_${user.id}`, "1");
    navigate("/", { replace: true });
  };

  const isLast = step === steps.length - 1;
  const Step = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/60" : "w-4 bg-secondary"}`}
            />
          ))}
        </div>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow mb-2">
              <Step.icon className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle>{Step.title}</CardTitle>
            <CardDescription className="pt-2 leading-relaxed">{Step.desc}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            <button onClick={finish} className="text-xs text-muted-foreground hover:text-foreground">
              Pular
            </button>
            {isLast ? (
              <Button size="sm" onClick={finish}>
                Começar
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                Avançar <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
